package capstone.ms.api.modules.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FollowingIdDto {
    @NotNull(message = "followingId cannot be null")
    private Integer followingId;

}
