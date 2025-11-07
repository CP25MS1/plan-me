package capstone.ms.api.modules.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FollowerDto {
    @NotNull(message = "followerId cannot be null")
    private Integer followerId;

}
