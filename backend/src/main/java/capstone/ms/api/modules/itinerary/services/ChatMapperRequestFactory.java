package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.modules.typhoon.dto.ChatMessage;
import capstone.ms.api.modules.typhoon.dto.ChatRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMapperRequestFactory {
    private static final String SYSTEM_PROMPT = """
            You are a compact, strict JSON extractor.
            Input: a raw email text and a reservation type (one of: LODGING, RESTAURANT, FLIGHT, TRAIN, BUS, FERRY, CAR_RENTAL).
            
            Task: extract reservation fields according to the schemas below, include top-level fields, include details for the given type, validate fields, and output ONLY ONE JSON object. No prose, no extra characters.
            
            Exact output:
            { "data": { "type": "...", "bookingRef": null|string, "contactTel": null|string, "contactEmail": null|string, "cost": number|null, "details": { ... } } }
            
            Rules:
            - Always return top-level keys inside "data": "type", "bookingRef", "contactTel", "contactEmail", "cost", "details".
            - If found `cost` parse as number (≥0). If parse fails or not found set to null.
            - Map only fields relevant to provided `type` into `data.details`.
            - Dates normalization:
              - date-time → ISO 8601 local date-time format (YYYY-MM-DDTHH:MM:SS), no timezone or offset
              - date → YYYY-MM-DD.
              - time → HH:MM:SS.
            - Strings: trim whitespace. If over max length, truncate to the max.
            - `contactTel`: string or null.
            - `contactEmail`: lowercase, basic email pattern check; If invalid → null.
            - `bookingRef`: string or null.
            - Arrays (e.g., passengers): return array of parsed objects or omit if none.
            - Another fields: **include** them in `details` if explicitly present in raw text (even embedded in sentences).
            - Extraction confidence: include optional field when text explicitly mentions it; do not invent values.
            
            Type-specific fields (put under data.details):
            - LODGING: lodgingName, lodgingAddress, underName, checkinDate, checkoutDate
            - RESTAURANT: restaurantName, restaurantAddress, underName, reservationDate
              - optional but include if present: reservationTime, tableNo, queueNo, partySize
            - FLIGHT: airline, flightNo, departureAirport, departureTime, arrivalAirport, arrivalTime
            - TRAIN: trainNo, trainClass, seatClass, seatNo, passengerName, departureStation, departureTime, arrivalStation, arrivalTime
            - BUS: transportCompany, departureStation, departureTime, arrivalStation, passengerName, seatNo
            - FERRY: transportCompany, passengerName, departurePort, departureTime, arrivalPort, arrivalTime, ticketType
            - CAR_RENTAL: rentalCompany, carModel, vrn, renterName, pickupLocation, pickupTime, dropoffLocation, dropoffTime
            
            Strict: produce ONLY the JSON object described. No explanations, no surrounding code fences.
            """;

    public ChatRequest create(String input, String type) {
        ChatMessage systemInstruction = ChatMessage.builder()
                .role("system")
                .content(SYSTEM_PROMPT)
                .build();

        ChatMessage userInstruction = ChatMessage.builder()
                .role("user")
                .content(String.format("""
                        Parse the reservation from this email.
                        ```
                        RAW_TEXT: %s
                        type: %s
                        ```
                        Return exactly one JSON object as specified by the system rules.
                        """, input, type))
                .build();

        return ChatRequest.builder()
                .model("typhoon-v2.5-30b-a3b-instruct")
                .messages(List.of(systemInstruction, userInstruction))
                .temperature(0.1)
                .maxTokens(80000)
                .topP(0.8)
                .frequencyPenalty(0.0)
                .build();
    }
}

