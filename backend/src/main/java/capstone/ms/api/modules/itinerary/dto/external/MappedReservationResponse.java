package capstone.ms.api.modules.itinerary.dto.external;

import capstone.ms.api.modules.itinerary.dto.reservation.ReservationDetails;
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

        private ReservationDetails details;
    }
}
