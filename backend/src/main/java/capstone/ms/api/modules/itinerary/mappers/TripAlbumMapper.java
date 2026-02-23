package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.itinerary.dto.album.TripAlbumDto;
import capstone.ms.api.modules.itinerary.entities.memory.TripAlbum;
import capstone.ms.api.modules.user.mappers.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface TripAlbumMapper {

    @Mapping(target = "albumId", source = "id")
    @Mapping(target = "tripId", source = "trip.id")
    @Mapping(target = "createdBy", source = "createdByUser")
    TripAlbumDto toDto(TripAlbum album);
}
