package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.email.services.EmailParser;
import capstone.ms.api.modules.email.services.ImapEmailFetcher;
import capstone.ms.api.modules.google_maps.services.PlacesService;
import capstone.ms.api.modules.itinerary.dto.external.MappedReservationResponse;
import capstone.ms.api.modules.itinerary.dto.reservation.LodgingDetails;
import capstone.ms.api.modules.itinerary.dto.reservation.ReservationDto;
import capstone.ms.api.modules.itinerary.dto.reservation.ReservationPreviewRequest;
import capstone.ms.api.modules.itinerary.dto.reservation.RestaurantDetails;
import capstone.ms.api.modules.itinerary.entities.ReservationType;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.mappers.ReservationMapper;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.typhoon.dto.ChatRequest;
import capstone.ms.api.modules.typhoon.services.impl.TyphoonServiceImpl;
import capstone.ms.api.modules.user.entities.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationExtractionService {
    private final TripRepository tripRepository;
    private final ImapEmailFetcher emailFetcher;
    private final EmailParser emailParser;
    private final TyphoonServiceImpl typhoonService;
    private final ReservationMapper reservationMapper;
    private final PlacesService placesService;
    private final ObjectMapper objectMapper;
    private final ChatMapperRequestFactory chatMapperRequestFactory;

    public List<ReservationDto> previewReservations(Integer tripId,
                                                    List<ReservationPreviewRequest> previewRequests,
                                                    User currentUser) {
        // permission check re-used
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("trip.404"));
        if (!trip.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("trip.403");
        }

        List<Integer> messageNumbers = previewRequests.stream()
                .map(ReservationPreviewRequest::getEmailId)
                .toList();

        Map<Integer, Message> messages = emailFetcher.fetchDetachedMessagesByNumbers(messageNumbers);

        return previewRequests.stream()
                .map(req -> handleSinglePreview(req, tripId, messages))
                .toList();
    }

    private ReservationDto handleSinglePreview(ReservationPreviewRequest req, Integer tripId, Map<Integer, Message> messages) {
        Integer emailId = req.getEmailId();
        String reservationType = req.getType().toUpperCase();
        Message inboxMessage = messages.get(emailId);

        if (inboxMessage == null) {
            log.error("Missing message for id {}", emailId);
            throw new ServerErrorException("reservation.email.500");
        }

        String emailText = emailParser.getTextFromMessage(inboxMessage);

        // first attempt: use email body
        String chatRes = callTyphoonAndAggregate(emailText, reservationType);

        // if invalid, try attachments -> OCR -> merged
        if (chatRes != null && chatRes.contains("\"valid\": false")) {
            Map<Integer, List<MultipartFile>> attachments = emailFetcher.fetchAttachmentsAsMultipartFiles(List.of(emailId));
            String ocrRes = attachments.getOrDefault(emailId, List.of()).stream()
                    .map(typhoonService::ocr)
                    .collect(Collectors.joining("\n"));

            String mergedInput = "Email text content:\n" + chatRes + "\nEmail attachment content:\n" + ocrRes;
            String chatResFromMerged = callTyphoonAndAggregate(mergedInput, reservationType);

            if (chatResFromMerged == null || chatResFromMerged.contains("\"valid\": false")) {
                log.error("Typhoon extraction invalid for emailId={} after OCR fallback", emailId);
                throw new ServerErrorException("reservation.email.500");
            }
            chatRes = chatResFromMerged;
        }

        if (chatRes == null) {
            log.error("Typhoon returned null for emailId={}", emailId);
            throw new ServerErrorException("reservation.email.500");
        }

        MappedReservationResponse mapped;
        try {
            mapped = objectMapper.readValue(chatRes, MappedReservationResponse.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse typhoon json for emailId={}", emailId, e);
            throw new ServerErrorException("reservation.email.500");
        }

        ReservationDto reservationDto = reservationMapper.toReservationDto(mapped);
        reservationDto.setTripId(tripId);

        // enrich GGMP if lodging/restaurant
        enrichGgmpId(reservationDto);

        return reservationDto;
    }

    private String callTyphoonAndAggregate(String input, String reservationType) {
        ChatRequest req = chatMapperRequestFactory.create(input, reservationType);
        // streamChat returns Flux<String> in original — collect to single string
        return typhoonService.streamChat(req)
                .collectList()
                .map(list -> String.join("", list))
                .block(); // blocking here is unchanged from original; consider async if needed
    }

    private void enrichGgmpId(ReservationDto dto) {
        try {
            ReservationType t = ReservationType.valueOf(dto.getType());
            switch (t) {
                case LODGING -> {
                    var d = (LodgingDetails) dto.getDetails();
                    String address = d.getLodgingName() + ": " + d.getLodgingAddress();
                    dto.setGgmpId(placesService.searchAndGetGgmpId(address));
                }
                case RESTAURANT -> {
                    var d = (RestaurantDetails) dto.getDetails();
                    String address = d.getRestaurantName() + ": " + d.getRestaurantAddress();
                    dto.setGgmpId(placesService.searchAndGetGgmpId(address));
                }
                default -> {
                }
            }
        } catch (Exception e) {
            log.warn("GGMP enrichment failed for reservation type {}", dto.getType(), e);
            // do not fail entire preview; keep ggmpId null
        }
    }
}

