package capstone.ms.api.modules.itinerary.dto.external;

import capstone.ms.api.modules.itinerary.dto.reservation.*;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MappedReservationResponse {
    private Result data;
    private Boolean valid;

    @Data
    public static class Result {
        private String type;
        private String bookingRef;
        private String contactTel;
        private String contactEmail;
        private BigDecimal cost;

        @JsonTypeInfo(
                use = JsonTypeInfo.Id.NAME,
                include = JsonTypeInfo.As.EXTERNAL_PROPERTY,
                property = "type"
        )
        @JsonSubTypes({
                @JsonSubTypes.Type(value = LodgingDetails.class, name = "LODGING"),
                @JsonSubTypes.Type(value = FlightDetails.class, name = "FLIGHT"),
                @JsonSubTypes.Type(value = RestaurantDetails.class, name = "RESTAURANT"),
                @JsonSubTypes.Type(value = TrainDetails.class, name = "TRAIN"),
                @JsonSubTypes.Type(value = BusDetails.class, name = "BUS"),
                @JsonSubTypes.Type(value = FerryDetails.class, name = "FERRY"),
                @JsonSubTypes.Type(value = CarRentalDetails.class, name = "CAR_RENTAL")
        })
        private ReservationDetails details;
    }
}
