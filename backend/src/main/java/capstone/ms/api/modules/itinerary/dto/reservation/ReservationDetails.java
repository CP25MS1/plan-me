package capstone.ms.api.modules.itinerary.dto.reservation;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

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
public interface ReservationDetails {
    String getType();
}
