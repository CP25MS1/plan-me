package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
@ErrorMessage(messageKey = "trip.400.create")
public class CreateTripDto {
    @NotNull(message = "Trip name cannot be null")
    @Size(max = 50, message = "Trip name cannot exceed 50 characters")
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;

    @Valid
    @Size(max = 3, message = "Objectives cannot exceed 3 items")
    private Set<ObjectiveInputDto> objectives;

    public void setName(String name) {
        this.name = name == null ? null : name.trim();
    }
}
