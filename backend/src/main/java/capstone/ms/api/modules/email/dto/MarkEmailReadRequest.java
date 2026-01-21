package capstone.ms.api.modules.email.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class MarkEmailReadRequest {

    @NotEmpty
    private List<Integer> emailIds;
}
