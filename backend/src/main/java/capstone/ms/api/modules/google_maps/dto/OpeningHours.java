package capstone.ms.api.modules.google_maps.dto;

import capstone.ms.api.modules.google_maps.dto.period.Period;
import lombok.Data;

import java.util.List;

@Data
public class OpeningHours {
    private List<Period> periods;
}
