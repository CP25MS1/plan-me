package capstone.ms.api.modules.google_maps.mappers;

import capstone.ms.api.modules.google_maps.dto.*;
import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlaceMapper {

    ObjectMapper JACKSON = new ObjectMapper();

    @Mapping(target = "ggmpId", source = "id")
    @Mapping(target = "enName", source = "displayName", qualifiedByName = "localizedToString")
    @Mapping(target = "enDescription", source = "editorialSummary", qualifiedByName = "localizedToString")
    @Mapping(target = "enAddress", source = "formattedAddress")
    @Mapping(target = "thName", source = "displayName", qualifiedByName = "localizedToString")
    @Mapping(target = "thDescription", source = "editorialSummary", qualifiedByName = "localizedToString")
    @Mapping(target = "thAddress", source = "formattedAddress")
    @Mapping(target = "rating", source = "rating", qualifiedByName = "doubleToShort")
    @Mapping(target = "openingHours", source = "regularOpeningHours", qualifiedByName = "serializeOpeningHours")
    @Mapping(target = "defaultPicUrl", source = "photos", qualifiedByName = "firstPhotoUrl")
    GoogleMapPlace toEntity(Place place);

    @Named("localizedToString")
    default String localizedToString(LocalizedText lt) {
        return lt == null ? "" : lt.getText();
    }

    @Named("doubleToShort")
    default Short doubleToShort(Double d) {
        return d == null ? 0 : (short) Math.round(d);
    }

    @Named("firstPhotoUrl")
    default String firstPhotoUrl(List<Photo> photos) {
        if (photos == null || photos.isEmpty()) return null;
        return photos.getFirst().getName();
    }

    @Named("serializeOpeningHours")
    default String serializeOpeningHours(OpeningHours oh) {
        try {
            return oh == null ? null : JACKSON.writeValueAsString(oh);
        } catch (Exception ignored) {
            return null;
        }
    }

    GoogleMapPlaceDto toGoogleMapPlaceDto(GoogleMapPlace place);
}
