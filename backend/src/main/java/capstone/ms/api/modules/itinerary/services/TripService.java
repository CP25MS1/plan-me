package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ConflictException;
import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.itinerary.dto.*;
import capstone.ms.api.modules.itinerary.entities.GoogleMapPlace;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.WishlistPlace;
import capstone.ms.api.modules.itinerary.mappers.ObjectiveMapper;
import capstone.ms.api.modules.itinerary.mappers.TripMapper;
import capstone.ms.api.modules.itinerary.repositories.BasicObjectiveRepository;
import capstone.ms.api.modules.itinerary.repositories.GoogleMapPlaceRepository;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.itinerary.repositories.WishlistPlaceRepository;
import capstone.ms.api.modules.user.entities.User;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final BasicObjectiveRepository basicObjectiveRepository;
    private final TripMapper tripMapper;
    private final ObjectiveMapper objectiveMapper;
    private final WishlistPlaceRepository wishlistPlaceRepository;
    private final GoogleMapPlaceRepository googleMapPlaceRepository;

    @Transactional
    public TripOverviewDto createTrip(UpsertTripDto tripInfo, User tripOwner) {
        validateDates(tripInfo.getStartDate(), tripInfo.getEndDate());

        final Trip tripEntity = tripMapper.tripDtoToEntity(tripInfo, tripOwner, objectiveMapper, basicObjectiveRepository);
        final Trip saved = tripRepository.save(tripEntity);
        return tripMapper.tripToTripOverviewDto(saved);
    }

    public Set<MergedObjective> getAllDefaultObjectives() {
        var defaultObjectives = basicObjectiveRepository.findAll();

        return defaultObjectives.stream()
                .map(objectiveMapper::basicObjectiveToMerged)
                .collect(Collectors.toSet());
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BadRequestException("400", "trip.400.endDate.conflict");
        }
    }

    public TripOverviewDto getTripOverview(Integer tripId, User currentUser) {
        Trip trip = loadTripOrThrow(tripId);
        ensureOwnerOrThrow(currentUser, trip);
        return tripMapper.tripToTripOverviewDto(trip);
    }

    @Transactional
    public TripOverviewDto updateTripOverview(final User currentUser, final Integer tripId, final UpsertTripDto tripInfo) {
        final Trip existing = loadTripOrThrow(tripId);
        ensureOwnerOrThrow(currentUser, existing);

        validateDates(tripInfo.getStartDate(), tripInfo.getEndDate());

        existing.getObjectives().clear();
        tripRepository.saveAndFlush(existing);

        if (tripInfo.getObjectives() != null && !tripInfo.getObjectives().isEmpty()) {
            final var newObjectives = objectiveMapper.toEntitySet(tripInfo.getObjectives(), basicObjectiveRepository);
            newObjectives.forEach(obj -> obj.setTrip(existing));
            existing.getObjectives().addAll(newObjectives);
        }

        existing.setName(tripInfo.getName());
        existing.setStartDate(tripInfo.getStartDate());
        existing.setEndDate(tripInfo.getEndDate());

        final Trip saved = tripRepository.save(existing);
        return tripMapper.tripToTripOverviewDto(saved);
    }

    private Trip loadTripOrThrow(final Integer tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("trip.404"));
    }

    private void ensureOwnerOrThrow(final User user, final Trip trip) {
        if (trip == null) {
            throw new NotFoundException("trip.404");
        }
        if (!trip.getOwner().getId().equals(user.getId())) {
            throw new ForbiddenException("trip.403");
        }
    }

    @Transactional
    public WishlistPlaceDto addPlaceToWishlist(Integer tripId, String ggmpId, User currentUser) {
        Trip trip = loadTripOrThrow(tripId);
        ensureOwnerOrThrow(currentUser, trip);

        GoogleMapPlace place = googleMapPlaceRepository.findById(ggmpId)
                .orElseThrow(() -> new NotFoundException("place.404.system"));

        boolean exists = wishlistPlaceRepository.existsByTripAndPlace(trip, place);

        if (exists) {
            throw new ConflictException("place.409.added");
        }

        WishlistPlace wp = new WishlistPlace();
        wp.setTrip(trip);
        wp.setPlace(place);
        wp.setNotes(null);
        WishlistPlace saved = wishlistPlaceRepository.save(wp);

        return tripMapper.mapWishlistPlaceToDto(saved);
    }

    @Transactional
    public UpdateWishlistPlaceNoteDto updateWishlistPlaceNote(User currentUser, Integer tripId, Integer placeId, UpdateWishlistPlaceNoteDto newNote) {
        Trip trip = loadTripOrThrow(tripId);
        ensureOwnerOrThrow(currentUser, trip);

        WishlistPlace wp = wishlistPlaceRepository.findById(placeId)
                .orElseThrow(() -> new NotFoundException("place.404.system"));

        if (!wp.getTrip().getId().equals(tripId)) {
            throw new NotFoundException("place.404.trip");
        }

        wp.setNotes(newNote.getNotes());
        WishlistPlace saved = wishlistPlaceRepository.save(wp);

        return UpdateWishlistPlaceNoteDto.builder()
                .notes(saved.getNotes())
                .build();
    }

    @Transactional
    public void removePlaceFromWishlist(User currentUser, Integer tripId, Integer placeId) {
        Trip trip = loadTripOrThrow(tripId);
        ensureOwnerOrThrow(currentUser, trip);

        WishlistPlace wp = wishlistPlaceRepository.findById(placeId)
                .orElseThrow(() -> new NotFoundException("place.404.system"));

        if (!wp.getTrip().getId().equals(tripId)) {
            throw new NotFoundException("place.404.trip");
        }

        wishlistPlaceRepository.delete(wp);
    }
}
