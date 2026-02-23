package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.itinerary.dto.memory.TripMemoryDto;
import capstone.ms.api.modules.itinerary.entities.memory.TripMemory;
import capstone.ms.api.modules.user.mappers.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface TripMemoryMapper {

    @Mapping(target = "albumId", source = "album.id")
    @Mapping(target = "tripId", source = "album.trip.id")
    @Mapping(target = "uploader", source = "uploader")
    @Mapping(target = "signedUrl", ignore = true)
    @Mapping(target = "signedUrlExpiresAt", ignore = true)
    TripMemoryDto toDto(TripMemory tripMemory);
}
