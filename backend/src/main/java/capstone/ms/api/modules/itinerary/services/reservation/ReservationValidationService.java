package capstone.ms.api.modules.itinerary.services.reservation;

import capstone.ms.api.modules.itinerary.dto.reservation.ReservationDto;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReservationValidationService {
    private final Validator validator;

    public boolean isReservationValid(ReservationDto dto) {
        if (dto == null || dto.getDetails() == null) {
            return false;
        }

        return isValid(dto) && isValid(dto.getDetails());
    }

    private boolean isValid(Object target) {
        return validator.validate(target).isEmpty();
    }
}
