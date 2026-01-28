package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.google_maps.clients.GoogleRoutesClient;
import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import capstone.ms.api.modules.google_maps.repositories.GoogleMapPlaceRepository;
import capstone.ms.api.modules.itinerary.dto.travel_segment.ComputeRouteRequestDto;
import capstone.ms.api.modules.itinerary.dto.travel_segment.RouteGoogleResultDto;
import capstone.ms.api.modules.itinerary.dto.travel_segment.TravelSegmentResponseDto;
import capstone.ms.api.modules.itinerary.entities.TravelSegment;
import capstone.ms.api.modules.itinerary.entities.TravelSegmentMode;
import capstone.ms.api.modules.itinerary.repositories.TravelSegmentRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class TravelSegmentService {

    private final GoogleMapPlaceRepository googleMapPlaceRepository;
    private final TravelSegmentRepository travelSegmentRepository;
    private final GoogleRoutesClient googleRoutesClient;

    @Transactional
    public TravelSegmentResponseDto createSegment(ComputeRouteRequestDto requestDto) {

        if (requestDto.getStartPlaceId() == null || requestDto.getEndPlaceId() == null) {
            throw new BadRequestException("400");
        }

        if (requestDto.getStartPlaceId().equals(requestDto.getEndPlaceId())) {
            throw new BadRequestException("400", "travelSegment.400.samePlaces");
        }

        GoogleMapPlace startPlace = googleMapPlaceRepository.findById(requestDto.getStartPlaceId())
                .orElseThrow(() -> new NotFoundException("place.404"));

        GoogleMapPlace endPlace = googleMapPlaceRepository.findById(requestDto.getEndPlaceId())
                .orElseThrow(() -> new NotFoundException("place.404"));

        TravelSegmentMode mode = parseMode(requestDto.getMode());

        Optional<TravelSegment> existingSegment =
                travelSegmentRepository.findByStartPlace_GgmpIdAndEndPlace_GgmpIdAndMode(startPlace.getGgmpId(), endPlace.getGgmpId(), mode.name());

        if (existingSegment.isPresent()) {
            return TravelSegmentMapper.toResponse(existingSegment.get());
        }

        RouteGoogleResultDto route = googleRoutesClient.computeRoute(requestDto, mode);

        if (route == null || route.getDistanceMeters() == null || route.getDurationSeconds() == null) {
            throw new ServerErrorException("travelSegment.500");
        }

        TravelSegment segment = new TravelSegment();
        segment.setStartPlace(startPlace);
        segment.setEndPlace(endPlace);
        segment.setMode(mode.name());
        segment.setDistance(route.getDistanceMeters());
        segment.setRegularDuration(route.getDurationSeconds());

        TravelSegment savedSegment = travelSegmentRepository.save(segment);

        return TravelSegmentMapper.toResponse(savedSegment);
    }

    private TravelSegmentMode parseMode(String mode) {
        if (mode == null || mode.isBlank()) {
            return TravelSegmentMode.CAR;
        }

        try {
            return TravelSegmentMode.valueOf(mode.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("400", "travelSegment.400.unsupportedMode");
        }
    }

    private static final class TravelSegmentMapper {

        private TravelSegmentMapper() {
        }

        private static TravelSegmentResponseDto toResponse(TravelSegment segment) {
            TravelSegmentResponseDto dto = new TravelSegmentResponseDto();
            dto.setStartPlaceId(segment.getStartPlace().getGgmpId());
            dto.setEndPlaceId(segment.getEndPlace().getGgmpId());
            dto.setMode(segment.getMode());
            dto.setDistance(segment.getDistance());
            dto.setRegularDuration(segment.getRegularDuration());

            return dto;
        }
    }
}
