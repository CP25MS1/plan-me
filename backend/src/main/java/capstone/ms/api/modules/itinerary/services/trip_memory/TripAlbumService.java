package capstone.ms.api.modules.itinerary.services.trip_memory;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ConflictException;
import capstone.ms.api.common.exceptions.MainException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.itinerary.dto.album.CreateTripAlbumResponse;
import capstone.ms.api.modules.itinerary.dto.album.TripAlbumListItemDto;
import capstone.ms.api.modules.itinerary.dto.album.TripAlbumListResponse;
import capstone.ms.api.modules.itinerary.dto.memory.TripMemoryDto;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.memory.TripAlbum;
import capstone.ms.api.modules.itinerary.entities.memory.TripMemory;
import capstone.ms.api.modules.itinerary.mappers.TripAlbumMapper;
import capstone.ms.api.modules.itinerary.repositories.TripAlbumRepository;
import capstone.ms.api.modules.itinerary.repositories.TripAlbumSummaryProjection;
import capstone.ms.api.modules.itinerary.repositories.TripMemoryRepository;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.itinerary.services.TripAccessService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripAlbumService {
    private final TripAccessService tripAccessService;
    private final TripRepository tripRepository;
    private final TripAlbumRepository tripAlbumRepository;
    private final TripMemoryRepository tripMemoryRepository;

    private final TripAlbumMapper tripAlbumMapper;
    private final TripMemoryUrlService tripMemoryUrlService;
    private final TripMemoryPolicyService tripMemoryPolicyService;
    private final TripAlbumCursorService tripAlbumCursorService;
    private final TripMemoryStorageService tripMemoryStorageService;

    @Transactional
    public CreateTripAlbumResponse createAlbum(
            Integer tripId,
            String name,
            List<MultipartFile> files,
            User currentUser
    ) {
        tripAccessService.assertOwnerAccess(currentUser, tripId);
        validateAlbumName(name);

        if (tripAlbumRepository.existsByTripId(tripId)) {
            throw new ConflictException("album.409.exists");
        }

        List<MultipartFile> uploadFiles = files == null ? List.of() : files;
        long totalRequestSize = 0;

        if (!uploadFiles.isEmpty()) {
            tripMemoryPolicyService.validateUploadRequest(uploadFiles);
            totalRequestSize = uploadFiles.stream().mapToLong(MultipartFile::getSize).sum();
            tripMemoryPolicyService.assertRequestSizeWithinLimit(totalRequestSize);
        }

        List<TripMemoryStorageService.UploadedMemoryCandidate> uploadedCandidates = new ArrayList<>();
        for (MultipartFile file : uploadFiles) {
            uploadedCandidates.add(tripMemoryStorageService.uploadSingleFile(tripId, file, "album.500.storage"));
        }

        try {
            Trip lockedTrip = tripRepository.findByIdForUpdate(tripId)
                    .orElseThrow(() -> new NotFoundException("trip.404"));

            if (tripAlbumRepository.existsByTripId(tripId)) {
                throw new ConflictException("album.409.exists");
            }

            if (!uploadFiles.isEmpty()) {
                long currentTotalSize = tripMemoryRepository.sumSizeBytesByTripId(tripId);
                tripMemoryPolicyService.assertTripQuotaWithinLimit(currentTotalSize + totalRequestSize);
            }

            TripAlbum newAlbum = new TripAlbum();
            newAlbum.setTrip(lockedTrip);
            newAlbum.setName(name.trim());
            newAlbum.setCreatedByUser(currentUser);

            TripAlbum savedAlbum = tripAlbumRepository.save(newAlbum);

            List<TripMemoryDto> memoryDtos = List.of();
            if (!uploadedCandidates.isEmpty()) {
                List<TripMemory> memories = uploadedCandidates.stream()
                        .map(candidate -> tripMemoryStorageService.toEntity(savedAlbum, currentUser, candidate))
                        .toList();

                List<TripMemory> savedMemories = tripMemoryRepository.saveAll(memories);
                tripMemoryRepository.flush();

                memoryDtos = savedMemories.stream()
                        .map(tripMemoryUrlService::toDtoWithSignedUrl)
                        .toList();
            }

            return CreateTripAlbumResponse.builder()
                    .album(tripAlbumMapper.toDto(savedAlbum))
                    .createdMemoriesCount(memoryDtos.size())
                    .memories(memoryDtos)
                    .build();
        } catch (MainException ex) {
            tripMemoryStorageService.cleanupUploadedObjects(uploadedCandidates);
            throw ex;
        } catch (RuntimeException ex) {
            tripMemoryStorageService.cleanupUploadedObjects(uploadedCandidates);
            throw new ServerErrorException("album.500.storage");
        }
    }

    @Transactional
    public void deleteAlbum(Integer tripId, User currentUser) {
        tripAccessService.assertOwnerAccess(currentUser, tripId);

        TripAlbum album = tripAlbumRepository.findByTripIdForUpdate(tripId)
                .orElseThrow(() -> new NotFoundException("album.404"));

        List<String> objectKeys = tripMemoryRepository.findObjectKeysByAlbumId(album.getId());
        for (String objectKey : objectKeys) {
            tripMemoryStorageService.deleteObjectOrThrow(objectKey, "album.500.storage");
        }

        tripAlbumRepository.delete(album);
    }

    public TripAlbumListResponse listAccessibleAlbums(User currentUser, Integer limit, String cursor) {
        int pageSize = tripAlbumCursorService.validateAndResolveLimit(limit);
        TripAlbumCursorService.CursorPayload cursorPayload = tripAlbumCursorService.decode(cursor);

        List<TripAlbumSummaryProjection> results;
        if (cursorPayload == null) {
            results = tripAlbumRepository.findAccessiblePageWithoutCursor(
                    currentUser.getId(),
                    PageRequest.of(0, pageSize + 1)
            );
        } else {
            results = tripAlbumRepository.findAccessiblePageWithCursor(
                    currentUser.getId(),
                    cursorPayload.createdAt(),
                    cursorPayload.id(),
                    PageRequest.of(0, pageSize + 1)
            );
        }

        boolean hasNext = results.size() > pageSize;
        List<TripAlbumSummaryProjection> pageItems = hasNext ? results.subList(0, pageSize) : results;

        String nextCursor = null;
        if (hasNext && !pageItems.isEmpty()) {
            TripAlbumSummaryProjection last = pageItems.get(pageItems.size() - 1);
            nextCursor = tripAlbumCursorService.encode(last.getCreatedAt(), last.getAlbumId());
        }

        List<TripAlbumListItemDto> items = pageItems.stream()
                .map(this::toAlbumListItem)
                .toList();

        return TripAlbumListResponse.builder()
                .items(items)
                .nextCursor(nextCursor)
                .build();
    }

    private TripAlbumListItemDto toAlbumListItem(TripAlbumSummaryProjection projection) {
        return TripAlbumListItemDto.builder()
                .albumId(projection.getAlbumId())
                .tripId(projection.getTripId())
                .tripName(projection.getTripName())
                .albumName(projection.getAlbumName())
                .memoryCount(projection.getMemoryCount() == null ? 0L : projection.getMemoryCount())
                .totalSizeBytes(projection.getTotalSizeBytes() == null ? 0L : projection.getTotalSizeBytes())
                .createdAt(projection.getCreatedAt())
                .build();
    }

    private void validateAlbumName(String name) {
        if (!StringUtils.hasText(name) || name.trim().length() > 50) {
            throw new BadRequestException("album.400", "album.400.name.invalid");
        }
    }
}
