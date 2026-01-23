package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.ForbiddenException;
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
import capstone.ms.api.modules.itinerary.mappers.ReservationMapper;
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

    private final ObjectMapper objectMapper;
    private final ImapEmailFetcher emailFetcher;
    private final EmailParser emailParser;

    private final TripAccessService tripAccessService;
    private final TyphoonServiceImpl typhoonService;
    private final PlacesService placesService;
    private final ChatMapperRequestFactory chatMapperRequestFactory;
    private final ReservationValidationService validationService;

    private final ReservationMapper reservationMapper;

    public List<ReservationDto> previewReservations(
            Integer tripId,
            List<ReservationPreviewRequest> requests,
            User currentUser
    ) {
        if (!tripAccessService.hasAccess(currentUser, tripId)) throw new ForbiddenException("trip.403");

        log.info(
                "Start previewReservations: tripId={}, userId={}, requestCount={}",
                tripId,
                currentUser.getId(),
                requests.size()
        );

        Map<Integer, Message> messages = fetchMessages(requests);

        return requests.stream()
                .map(req -> extractSingleReservation(req, tripId, messages))
                .toList();
    }

    private ReservationDto extractSingleReservation(
            ReservationPreviewRequest request,
            Integer tripId,
            Map<Integer, Message> messages
    ) {
        log.info(
                "Extract reservation: emailId={}, type={}",
                request.getEmailId(),
                request.getType()
        );

        Integer emailId = request.getEmailId();
        String reservationType = request.getType().toUpperCase();

        Message message = requireMessage(emailId, messages);
        String emailBody = emailParser.getTextFromMessage(message);

        ReservationDto reservation = parseFromEmailBody(
                emailBody,
                reservationType,
                tripId
        );

        if (!validationService.isReservationValid(reservation)) {
            reservation = parseFromAttachmentsFallback(
                    emailId,
                    reservation,
                    reservationType,
                    tripId
            );
        }

        enrichGgmpIdIfApplicable(reservation);
        return reservation;
    }

    private ReservationDto parseFromEmailBody(
            String emailText,
            String reservationType,
            Integer tripId
    ) {
        String llmResult = callTyphoon(emailText, reservationType);
        log.info("Typhoon raw response: {}", llmResult);
        return mapToReservationOrThrow(llmResult, tripId);
    }

    private ReservationDto parseFromAttachmentsFallback(
            Integer emailId,
            ReservationDto bodyResult,
            String reservationType,
            Integer tripId
    ) {
        String attachmentText = fetchAndOcrAttachments(emailId);

        String mergedInput = """
                Email text content:
                %s
                Email attachment content:
                %s
                """.formatted(bodyResult, attachmentText);

        ReservationDto mergedResult = parseFromEmailBody(
                mergedInput,
                reservationType,
                tripId
        );

        if (!validationService.isReservationValid(mergedResult)) {
            throw new ServerErrorException("reservation.email.500");
        }

        return mergedResult;
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

    private String fetchAndOcrAttachments(Integer emailId) {
        Map<Integer, List<MultipartFile>> attachments =
                emailFetcher.fetchAttachmentsAsMultipartFiles(List.of(emailId));

        return attachments.getOrDefault(emailId, List.of()).stream()
                .map(typhoonService::ocr)
                .collect(Collectors.joining("\n"));
    }

    private ReservationDto mapToReservationOrThrow(String source, Integer tripId) {
        try {
            MappedReservationResponse mapped =
                    objectMapper.readValue(source, MappedReservationResponse.class);

            ReservationDto dto = reservationMapper.toReservationDto(mapped);
            dto.setTripId(tripId);

            log.info(
                    "Mapped reservation: type={}, tripId={}",
                    dto.getType(),
                    tripId
            );

            return dto;

        } catch (JsonProcessingException e) {
            throw new ServerErrorException("reservation.email.500");
        }
    }

    private void enrichGgmpIdIfApplicable(ReservationDto dto) {
        try {
            ReservationType type = ReservationType.valueOf(dto.getType());

            switch (type) {
                case LODGING -> enrichLodgingGgmp(dto);
                case RESTAURANT -> enrichRestaurantGgmp(dto);
                default -> {
                    // do nothing
                }
            }
        } catch (Exception e) {
            log.warn("GGMP enrichment failed for reservation type {}", dto.getType(), e);
        }
    }

    private void enrichLodgingGgmp(ReservationDto dto) {
        LodgingDetails details = (LodgingDetails) dto.getDetails();
        String query = details.getLodgingName() + ": " + details.getLodgingAddress();
        dto.setGgmpId(placesService.searchAndGetGgmpId(query));
    }

    private void enrichRestaurantGgmp(ReservationDto dto) {
        RestaurantDetails details = (RestaurantDetails) dto.getDetails();
        String query = details.getRestaurantName() + ": " + details.getRestaurantAddress();
        dto.setGgmpId(placesService.searchAndGetGgmpId(query));
    }

    private Map<Integer, Message> fetchMessages(List<ReservationPreviewRequest> requests) {
        List<Integer> emailIds = requests.stream()
                .map(ReservationPreviewRequest::getEmailId)
                .toList();

        return emailFetcher.fetchDetachedMessagesByNumbers(emailIds);
    }

    private Message requireMessage(Integer emailId, Map<Integer, Message> messages) {
        Message message = messages.get(emailId);
        if (message == null) {
            log.error("Missing message for id {}", emailId);
            throw new ServerErrorException("reservation.email.500");
        }
        return message;
    }
}
