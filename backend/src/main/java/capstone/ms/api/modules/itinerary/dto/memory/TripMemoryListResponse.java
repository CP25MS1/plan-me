package capstone.ms.api.modules.itinerary.dto.memory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripMemoryListResponse {
    private List<TripMemoryDto> items;
    private String nextCursor;
}
