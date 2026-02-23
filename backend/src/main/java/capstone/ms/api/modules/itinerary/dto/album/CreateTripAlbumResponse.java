package capstone.ms.api.modules.itinerary.dto.album;

import capstone.ms.api.modules.itinerary.dto.memory.TripMemoryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTripAlbumResponse {
    private TripAlbumDto album;
    private Integer createdMemoriesCount;
    private List<TripMemoryDto> memories;
}
