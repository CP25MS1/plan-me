package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.google_maps.clients.GoogleRoutesClient;
import capstone.ms.api.modules.google_maps.repositories.GoogleMapPlaceRepository;
import capstone.ms.api.modules.itinerary.dto.travel_segment.ComputeRouteRequestDto;
import capstone.ms.api.modules.itinerary.dto.travel_segment.RouteGoogleResultDto;
import capstone.ms.api.modules.itinerary.dto.travel_segment.TravelSegmentResponseDto;
import capstone.ms.api.modules.itinerary.entities.TravelSegment;
import capstone.ms.api.modules.itinerary.entities.TravelSegmentMode;
import capstone.ms.api.modules.itinerary.repositories.TravelSegmentRepository;
import lombok.AllArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class TravelSegmentService {

    private final GoogleMapPlaceRepository googleMapPlaceRepository;
    private final TravelSegmentRepository travelSegmentRepository;
    private final GoogleRoutesClient googleRoutesClient;

    public TravelSegmentResponseDto createSegment(ComputeRouteRequestDto requestDto) {

        if (requestDto.getStartPlaceId() == null || requestDto.getEndPlaceId() == null) {
            throw new BadRequestException("400");
        }

        if (requestDto.getStartPlaceId().equals(requestDto.getEndPlaceId())) {
            throw new BadRequestException("400", "travelSegment.400.samePlaces");
        }

        TravelSegmentMode mode = parseMode(requestDto.getMode());

        Optional<TravelSegment> existingSegment =
                travelSegmentRepository.findByStartPlace_GgmpIdAndEndPlace_GgmpIdAndMode(requestDto.getStartPlaceId(), requestDto.getEndPlaceId(), mode.name());

        if (existingSegment.isPresent()) {
            return TravelSegmentMapper.toResponse(existingSegment.get(), requestDto.getStartPlaceId(), requestDto.getEndPlaceId());
        }

        // Validate places exist before calling external API
        googleMapPlaceRepository.findById(requestDto.getStartPlaceId())
                .orElseThrow(() -> new NotFoundException("place.404"));

        googleMapPlaceRepository.findById(requestDto.getEndPlaceId())
                .orElseThrow(() -> new NotFoundException("place.404"));

        RouteGoogleResultDto route = googleRoutesClient.computeRoute(requestDto, mode);

        if (route == null || route.getDistanceMeters() == null || route.getDurationSeconds() == null) {
            throw new ServerErrorException("travelSegment.500");
        }

        // Re-check after external call in case another request created it first
        Optional<TravelSegment> existingSegmentAfterCompute =
                travelSegmentRepository.findByStartPlace_GgmpIdAndEndPlace_GgmpIdAndMode(requestDto.getStartPlaceId(), requestDto.getEndPlaceId(), mode.name());

        if (existingSegmentAfterCompute.isPresent()) {
            return TravelSegmentMapper.toResponse(existingSegmentAfterCompute.get(), requestDto.getStartPlaceId(), requestDto.getEndPlaceId());
        }

        TravelSegment segment = new TravelSegment();
        segment.setStartPlace(googleMapPlaceRepository.getReferenceById(requestDto.getStartPlaceId()));
        segment.setEndPlace(googleMapPlaceRepository.getReferenceById(requestDto.getEndPlaceId()));
        segment.setMode(mode.name());
        segment.setDistance(route.getDistanceMeters());
        segment.setRegularDuration(route.getDurationSeconds());

        try {
            TravelSegment savedSegment = travelSegmentRepository.saveAndFlush(segment);
            return TravelSegmentMapper.toResponse(savedSegment, requestDto.getStartPlaceId(), requestDto.getEndPlaceId());
        } catch (DataIntegrityViolationException e) {
            Optional<TravelSegment> existingSegmentAfterViolation =
                    travelSegmentRepository.findByStartPlace_GgmpIdAndEndPlace_GgmpIdAndMode(requestDto.getStartPlaceId(), requestDto.getEndPlaceId(), mode.name());

            if (existingSegmentAfterViolation.isPresent()) {
                return TravelSegmentMapper.toResponse(existingSegmentAfterViolation.get(), requestDto.getStartPlaceId(), requestDto.getEndPlaceId());
            }

            throw new ServerErrorException("travelSegment.500");
        }
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

        private static TravelSegmentResponseDto toResponse(TravelSegment segment, String startPlaceId, String endPlaceId) {
            TravelSegmentResponseDto dto = new TravelSegmentResponseDto();
            dto.setStartPlaceId(startPlaceId);
            dto.setEndPlaceId(endPlaceId);
            dto.setMode(segment.getMode());
            dto.setDistance(segment.getDistance());
            dto.setRegularDuration(segment.getRegularDuration());

            return dto;
        }
    }
}
