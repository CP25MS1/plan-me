package capstone.ms.api.modules.google_maps.dto.period;

import lombok.Data;

import java.time.LocalDate;

@Data
public class Point {
    private LocalDate date;
    private Boolean truncated;
    private Integer day;
    private Integer hour;
    private Integer minute;
}
