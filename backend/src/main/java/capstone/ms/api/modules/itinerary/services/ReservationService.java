package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.email.services.EmailParser;
import capstone.ms.api.modules.email.services.EmailService;
import capstone.ms.api.modules.email.services.ImapEmailFetcher;
import capstone.ms.api.modules.itinerary.dto.reservation.*;
import capstone.ms.api.modules.itinerary.entities.*;
import capstone.ms.api.modules.itinerary.mappers.ReservationMapper;
import capstone.ms.api.modules.itinerary.repositories.*;
import capstone.ms.api.modules.typhoon.dto.ChatMessage;
import capstone.ms.api.modules.typhoon.dto.ChatRequest;
import capstone.ms.api.modules.typhoon.services.TyphoonService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Store;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@AllArgsConstructor
@Slf4j
public class ReservationService {
    private final TripRepository tripRepository;
    private final ReservationRepository reservationRepository;
    private final LodgingReservationRepository lodgingRepository;
    private final FlightReservationRepository flightRepository;
    private final RestaurantReservationRepository restaurantRepository;
    private final TrainReservationRepository trainRepository;
    private final BusReservationRepository busRepository;
    private final FerryReservationRepository ferryRepository;
    private final CarRentalReservationRepository carRentalRepository;
    private final ReservationMapper reservationMapper;
    private final ImapEmailFetcher emailFetcher;
    private EmailService emailService;
    private EmailParser emailParser;
    private TyphoonService typhoonService;

    private Trip loadTripOrThrow(final Integer tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("trip.404"));
    }

    private void ensureOwnerOrThrow(final User user, final Trip trip) {
        if (trip == null) {
            throw new NotFoundException("trip.404");
        }
        if (!trip.getOwner().getId().equals(user.getId())) {
            throw new ForbiddenException("trip.403");
        }
    }

    private <T> T validateAndMap(T entity) {
        if (entity == null) {
            throw new BadRequestException("reservation.400");
        }
        return entity;
    }

    @Transactional
    public ReservationDto createReservation(ReservationDto dto, User currentUser) {

        if (dto.getTripId() == null || dto.getType() == null) {
            throw new BadRequestException("reservation.400");
        }

        if (dto.getDetails() == null) {
            throw new BadRequestException("reservation.400");
        }

        if (!dto.getType().equals(dto.getDetails().getType())) {
            throw new BadRequestException("reservation.400");
        }

        Trip trip = loadTripOrThrow(dto.getTripId());
        ensureOwnerOrThrow(currentUser, trip);

        Reservation reservation = reservationMapper.dtoToReservation(dto);
        reservation.setTrip(trip);
        reservationRepository.save(reservation);

        switch (dto.getType()) {
            case "LODGING": {
                LodgingDetails detailDto = (LodgingDetails) dto.getDetails();
                LodgingReservation entity = validateAndMap(
                        reservationMapper.lodgingDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                lodgingRepository.save(entity);
                break;
            }
            case "FLIGHT": {
                FlightDetails detailDto = (FlightDetails) dto.getDetails();
                FlightReservation entity = validateAndMap(
                        reservationMapper.flightDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                flightRepository.save(entity);
                break;
            }
            case "RESTAURANT": {
                RestaurantDetails detailDto = (RestaurantDetails) dto.getDetails();
                RestaurantReservation entity = validateAndMap(
                        reservationMapper.restaurantDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                restaurantRepository.save(entity);
                break;
            }
            case "TRAIN": {
                TrainDetails detailDto = (TrainDetails) dto.getDetails();
                TrainReservation entity = validateAndMap(
                        reservationMapper.trainDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                trainRepository.save(entity);
                break;
            }
            case "BUS": {
                BusDetails detailDto = (BusDetails) dto.getDetails();
                BusReservation entity = validateAndMap(
                        reservationMapper.busDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                busRepository.save(entity);
                break;
            }
            case "FERRY": {
                FerryDetails detailDto = (FerryDetails) dto.getDetails();
                FerryReservation entity = validateAndMap(
                        reservationMapper.ferryDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                ferryRepository.save(entity);
                break;
            }
            case "CAR_RENTAL": {
                CarRentalDetails detailDto = (CarRentalDetails) dto.getDetails();
                CarRentalReservation entity = validateAndMap(
                        reservationMapper.carRentalDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                carRentalRepository.save(entity);
                break;
            }
            default:
                throw new BadRequestException("reservation.400");
        }

        dto.setId(reservation.getId());
        return dto;
    }

    @Transactional
    public ReservationDto updateReservation(Integer reservationId, ReservationDto dto, User currentUser) {
        if (dto.getTripId() == null || dto.getType() == null || dto.getDetails() == null) {
            throw new BadRequestException("reservation.400");
        }
        if (!dto.getType().equals(getDetailsType(dto.getDetails()))) {
            throw new BadRequestException("reservation.400");
        }

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NotFoundException("reservation.404"));

        ensureOwnerOrThrow(currentUser, reservation.getTrip());

        reservation.setTrip(tripRepository.findById(dto.getTripId())
                .orElseThrow(() -> new NotFoundException("trip.404")));
        reservation.setGgmpId(dto.getGgmpId());
        reservation.setBookingRef(dto.getBookingRef());
        reservation.setContactTel(dto.getContactTel());
        reservation.setContactEmail(dto.getContactEmail());
        reservation.setCost(dto.getCost());

        reservationRepository.save(reservation);

        switch (dto.getType()) {
            case "LODGING": {
                LodgingDetails details = (LodgingDetails) dto.getDetails();
                LodgingReservation entity = lodgingRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("lodging.404"));
                reservationMapper.updateLodgingEntityFromDto(details, entity);
                lodgingRepository.save(entity);
                break;
            }
            case "FLIGHT": {
                FlightDetails details = (FlightDetails) dto.getDetails();
                FlightReservation entity = flightRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("flight.404"));

                reservationMapper.updateFlightEntityFromDto(details, entity);

                flightRepository.save(entity);
                break;
            }
            case "RESTAURANT": {
                RestaurantDetails details = (RestaurantDetails) dto.getDetails();
                RestaurantReservation entity = restaurantRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("restaurant.404"));
                reservationMapper.updateRestaurantEntityFromDto(details, entity);
                restaurantRepository.save(entity);
                break;
            }
            case "TRAIN": {
                TrainDetails details = (TrainDetails) dto.getDetails();
                TrainReservation entity = trainRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("train.404"));
                reservationMapper.updateTrainEntityFromDto(details, entity);
                trainRepository.save(entity);
                break;
            }
            case "BUS": {
                BusDetails details = (BusDetails) dto.getDetails();
                BusReservation entity = busRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("bus.404"));
                reservationMapper.updateBusEntityFromDto(details, entity);
                busRepository.save(entity);
                break;
            }
            case "FERRY": {
                FerryDetails details = (FerryDetails) dto.getDetails();
                FerryReservation entity = ferryRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("ferry.404"));
                reservationMapper.updateFerryEntityFromDto(details, entity);
                ferryRepository.save(entity);
                break;
            }
            case "CAR_RENTAL": {
                CarRentalDetails details = (CarRentalDetails) dto.getDetails();
                CarRentalReservation entity = carRentalRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("car_rental.404"));
                reservationMapper.updateCarRentalEntityFromDto(details, entity);
                carRentalRepository.save(entity);
                break;
            }
            default:
                throw new BadRequestException("reservation.400");
        }

        dto.setId(reservation.getId());
        return dto;
    }

    private String getDetailsType(ReservationDetails details) {
        if (details instanceof LodgingDetails) return "LODGING";
        if (details instanceof FlightDetails) return "FLIGHT";
        if (details instanceof RestaurantDetails) return "RESTAURANT";
        if (details instanceof TrainDetails) return "TRAIN";
        if (details instanceof BusDetails) return "BUS";
        if (details instanceof FerryDetails) return "FERRY";
        if (details instanceof CarRentalDetails) return "CAR_RENTAL";
        throw new BadRequestException("reservation.400");
    }

    public List<EmailInfoDto> checkEmailInfo(Integer tripId, User currentUser) {
        Trip trip = loadTripOrThrow(tripId);
        ensureOwnerOrThrow(currentUser, trip);

        String alias = String.valueOf(tripId);
        String toAddress = emailService.buildAddressWithAlias(alias);

        Map<String, String> criteria = new HashMap<>();
        criteria.put("TO", toAddress);
        criteria.put("UNREAD", "true");

        try (Store store = emailService.openImapStore()
                .orElseThrow(() -> new ServerErrorException("email.500.notOpenIMAP"))) {

            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_ONLY);

            Message[] messages = inbox.search(emailService.buildSearchTerm(criteria).orElse(null));

            return Arrays.stream(messages)
                    .map(msg -> {
                        try {
                            if (msg.getSentDate() == null) return null;
                            return EmailInfoDto.builder()
                                    .emailId(msg.getMessageNumber())
                                    .sentAt(msg.getSentDate().toString())
                                    .subject(msg.getSubject())
                                    .build();
                        } catch (MessagingException e) {
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .toList();

        } catch (Exception e) {
            throw new ServerErrorException("email.500.fetchEmail");
        }
    }

    public List<String> previewReservation(Integer tripId, List<ReservationPreviewRequest> previewRequests, User currentUser) {
        Trip trip = loadTripOrThrow(tripId);
        ensureOwnerOrThrow(currentUser, trip);

        List<Integer> messageNumbers = previewRequests.stream()
                .map(ReservationPreviewRequest::getEmailId)
                .toList();

        Map<Integer, Message> messages = emailFetcher.fetchDetachedMessagesByNumbers(messageNumbers);

        return previewRequests.stream()
                .map(req -> {
                    Integer emailId = req.getEmailId();
                    String type = req.getType().toUpperCase();
                    Message msg = messages.get(emailId);

                    String emailText = emailParser.getTextFromMessage(msg);

                    var mapperRequest = createReservationMapperRequest(emailText, type);
                    var res = typhoonService.streamChat(mapperRequest)
                            .collectList()
                            .map(list -> String.join("", list))
                            .block();

                    if (res != null && res.contains("\"valid\":false")) {
                        var attachments = emailFetcher.fetchAttachmentsAsMultipartFiles(messageNumbers);
                    }
                    return res;
                })
                .toList();
    }

    private ChatRequest createReservationMapperRequest(final String input, final String type) {
        ChatMessage systemInstruction = ChatMessage.builder()
                .role("system")
                .content("""
                        You are a compact, strict JSON extractor. \s
                        Input: a raw email text and a reservation type (one of: LODGING, RESTAURANT, FLIGHT, TRAIN, BUS, FERRY, CAR_RENTAL).
                        
                        Task: extract reservation fields according to the schemas below, include top-level fields, include details for the given type, validate required fields, and output ONLY ONE JSON object. No prose, no extra characters.
                        
                        Exact output (one of):
                        { "data": { "type": "...", "bookingRef": null|string, "contactTel": null|string, "contactEmail": null|string, "cost": number|null, "details": { ... } }, "valid": true }
                        or
                        { "data": { ... }, "valid": false, "missing": ["path","path" , ...] }
                        
                        Rules:
                        - Always return top-level keys inside "data": "type", "bookingRef", "contactTel", "contactEmail", "cost", "details".
                        - `cost` is required across types. If found parse as number (≥0). If parse fails or not found set to null and list "cost" in "missing".
                        - Map only fields relevant to provided `type` into `data.details`.
                        - For required fields missing after extraction, add JSON paths to "missing". Use paths like "details.restaurantName" or top-level "cost".
                        - If any required field missing → set "valid": false and include "missing". If none missing → "valid": true and omit "missing".
                        - Dates normalization:
                          - date-time → ISO 8601 (YYYY-MM-DDTHH:MM:SSZ or with offset).
                          - date → YYYY-MM-DD.
                          - time → HH:MM:SS.
                        - Strings: trim whitespace. If over max length, truncate to the max.
                        - `contactTel`: extract digits only. If more than 10 digits, keep the last 10. If none → null.
                        - `contactEmail`: lowercase, basic email pattern check; truncate to 80 chars. If invalid → null.
                        - `bookingRef`: string or null.
                        - Arrays (e.g., passengers): return array of parsed objects or omit if none.
                        - Optional fields: **include** them in `details` if explicitly present in raw text (even embedded in sentences). Try common synonyms and patterns (e.g., "table 5", "tbl#5", "queue Q18", "party of 4", currency like "THB 2,800", "total 2800").
                        - Extraction confidence: include optional field when text explicitly mentions it; do not invent values. For inferred times/dates (e.g., "7:30 PM") convert to HH:MM:SS.
                        - For fields that fail parsing (e.g., date parse error), set value to null and include in "missing" if required.
                        - Keep output minimal. The only allowed diagnostic key is "missing" when valid is false.
                        
                        Type-specific required fields (put under data.details):
                        - LODGING: lodgingName, lodgingAddress, underName, checkinDate, checkoutDate
                        - RESTAURANT: restaurantName, restaurantAddress, underName, reservationDate
                          - optional but include if present: reservationTime, tableNo, queueNo, partySize
                        - FLIGHT: airline, flightNo, departureAirport, departureTime, arrivalAirport, arrivalTime
                          - optional: boardingTime, gateNo, flightClass, passengers (array of {passengerName, seatNo})
                        - TRAIN: trainNo, trainClass, seatClass, seatNo, passengerName, departureStation, departureTime, arrivalStation, arrivalTime
                        - BUS: transportCompany, departureStation, departureTime, arrivalStation, passengerName, seatNo
                          - optional: busClass
                        - FERRY: transportCompany, passengerName, departurePort, departureTime, arrivalPort, arrivalTime, ticketType
                        - CAR_RENTAL: rentalCompany, carModel, vrn, renterName, pickupLocation, pickupTime, dropoffLocation, dropoffTime
                        
                        Strict: produce ONLY the JSON object described. No explanations, no surrounding code fences.
                        """)
                .build();

        ChatMessage inputInstruction = ChatMessage.builder()
                .role("user")
                .content(String.format("""
                        Parse the reservation from this email.
                        ```
                        RAW_TEXT: %s
                        type: %s                # one of: LODGING, RESTAURANT, FLIGHT, TRAIN, BUS, FERRY, CAR_RENTAL
                        ```
                        Return exactly one JSON object as specified by the system rules.
                        """, input, type))
                .build();

        return ChatRequest.builder()
                .model("typhoon-v2.5-30b-a3b-instruct")
                .messages(List.of(systemInstruction, inputInstruction))
                .temperature(0.1)
                .maxTokens(1024)
                .topP(0.8)
                .frequencyPenalty(0.0)
                .build();
    }

}
