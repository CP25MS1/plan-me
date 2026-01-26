package capstone.ms.api.modules.itinerary.services.reservation;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.itinerary.dto.external.MappedReservationResponse;
import capstone.ms.api.modules.itinerary.dto.reservation.ReservationDto;
import capstone.ms.api.modules.itinerary.entities.reservation.ReservationType;
import capstone.ms.api.modules.itinerary.mappers.ReservationMapper;
import capstone.ms.api.modules.itinerary.services.TripAccessService;
import capstone.ms.api.modules.typhoon.dto.ChatRequest;
import capstone.ms.api.modules.typhoon.services.impl.TyphoonServiceImpl;
import capstone.ms.api.modules.user.entities.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileReservationExtractorService {

    private static final long MAX_TOTAL_SIZE = 20L * 1024 * 1024;
    private static final Set<String> SUPPORTED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png");
    private final ObjectMapper objectMapper;

    private final TripAccessService tripAccessService;
    private final TyphoonServiceImpl typhoonService;
    private final ChatMapperRequestFactory chatMapperRequestFactory;
    private final ReservationValidationService validationService;

    private final ReservationMapper reservationMapper;

    public List<ReservationDto> previewReservationsFiles(Integer tripId, List<MultipartFile> files, List<String> types, User currentUser) {
        if (!tripAccessService.hasAccess(currentUser, tripId)) {
            throw new ForbiddenException("trip.403");
        }

        validateFilesRequest(files, types);
        validateTotalFileSize(files);
        validateFileExtensions(files);

        List<ReservationDto> results = new ArrayList<>();
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            ReservationType type = ReservationType.valueOf(types.get(i).toUpperCase());

            try {
                byte[] fileBytes = file.getBytes();
                String filename = file.getOriginalFilename();

                ReservationDto dto = previewSingleFile(fileBytes, filename, type, tripId);
                results.add(dto);

            } catch (BadRequestException | ServerErrorException e) {
                throw e;
            } catch (IOException e) {
                throw new ServerErrorException("reservation.file.500");
            }
        }
        return results;
    }

    private void validateFilesRequest(List<MultipartFile> files, List<String> types) throws
            BadRequestException {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("reservation.400");
        }

        if (types == null || files.size() != types.size()) {
            throw new BadRequestException("reservation.400", "reservation.400.type.notEqual");
        }

        for (String t : types) {
            try {
                ReservationType.valueOf(t.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("reservation.400", "reservation.400.type.invalid");
            }
        }
    }

    private void validateTotalFileSize(List<MultipartFile> files) {
        long totalSize = files.stream()
                .mapToLong(MultipartFile::getSize)
                .sum();

        if (totalSize > MAX_TOTAL_SIZE) {
            throw new BadRequestException("reservation.400", "reservation.400.file.maxSize");
        }
    }

    private void validateFileExtensions(List<MultipartFile> files) {
        for (MultipartFile file : files) {
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.contains(".")) {
                throw new BadRequestException("reservation.400", "reservation.400.file.type");
            }

            String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
            if (!SUPPORTED_EXTENSIONS.contains(ext)) {
                throw new BadRequestException("reservation.400", "reservation.400.file.type");
            }
        }
    }

    private ReservationDto previewSingleFile(byte[] fileBytes, String filename, ReservationType type, Integer tripId) {
        String ocrText = typhoonService.ocr(fileBytes, filename);

        if (ocrText == null || ocrText.isBlank()) {
            throw new ServerErrorException("reservation.file.500", "reservation.500.file.ocrFailed");
        }

        String llmResult = callTyphoon(ocrText, type.name());

        ReservationDto dto;
        try {
            MappedReservationResponse mapped = objectMapper.readValue(llmResult, MappedReservationResponse.class);

            dto = reservationMapper.toReservationDto(mapped);
            dto.setTripId(tripId);

        } catch (BadRequestException e) {
            throw e;

        } catch (Exception e) {
            throw new ServerErrorException("reservation.file.500", "reservation.500.file.mapFailed");
        }

        if (!validationService.isReservationValid(dto)) {
            throw new ServerErrorException("reservation.file.500", "reservation.500.file.invalidOrNotMatched");
        }

        return dto;
    }

    private String callTyphoon(String input, String reservationType) {
        log.info(
                "Calling Typhoon: reservationType={}, inputLength={}",
                reservationType,
                input.length()
        );

        ChatRequest request = chatMapperRequestFactory.create(input, reservationType);

        return typhoonService.streamChat(request)
                .collectList()
                .map(chunks -> String.join("", chunks))
                .block(); // intentionally blocking (unchanged behavior)
    }
}
