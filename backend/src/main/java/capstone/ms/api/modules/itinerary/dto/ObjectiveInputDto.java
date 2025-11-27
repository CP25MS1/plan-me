package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.common.annotations.ErrorMessage;
import capstone.ms.api.common.exceptions.BadRequestException;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@ErrorMessage(messageKey = "400")
public class ObjectiveInputDto {
    private Integer boId;
    private Integer id;
    @Size(max = 25, message = "Objective name cannot exceed 25 characters")
    private String name;
    private String badgeColor;

    public void setName(String name) {
        this.name = name == null ? null : name.trim();
    }

    public void setBadgeColor(String badgeColor) {
        if (badgeColor != null && !badgeColor.matches("^#([A-Fa-f0-9]{6})$")) {
            throw new BadRequestException("400", "trip.400.badgeColor.format");
        }

        this.badgeColor = badgeColor;
    }

}
