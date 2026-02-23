package capstone.ms.api.modules.itinerary.services.trip_memory;

import capstone.ms.api.common.exceptions.MainException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.itinerary.dto.memory.CreateTripMemoryResponse;
import capstone.ms.api.modules.itinerary.dto.memory.TripMemoryDto;
import capstone.ms.api.modules.itinerary.dto.memory.TripMemoryListResponse;
import capstone.ms.api.modules.itinerary.dto.memory.TripMemorySignedUrlResponse;
import capstone.ms.api.modules.itinerary.entities.memory.TripAlbum;
import capstone.ms.api.modules.itinerary.entities.memory.TripMemory;
import capstone.ms.api.modules.itinerary.repositories.TripAlbumRepository;
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
public class TripMemoryService {
    private final TripAccessService tripAccessService;
    private final TripRepository tripRepository;
    private final TripAlbumRepository tripAlbumRepository;
    private final TripMemoryRepository tripMemoryRepository;

    private final TripMemoryPolicyService tripMemoryPolicyService;
    private final TripMemoryUrlService tripMemoryUrlService;
    private final TripMemoryCursorService tripMemoryCursorService;
    private final TripMemoryStorageService tripMemoryStorageService;

    @Transactional
    public CreateTripMemoryResponse uploadMemories(Integer tripId, List<MultipartFile> files, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);
        tripMemoryPolicyService.validateUploadRequest(files);

        tripAlbumRepository.findByTripId(tripId).orElseThrow(() -> new NotFoundException("album.404"));

        long totalRequestSize = files.stream().mapToLong(MultipartFile::getSize).sum();
        tripMemoryPolicyService.assertRequestSizeWithinLimit(totalRequestSize);

        List<TripMemoryStorageService.UploadedMemoryCandidate> uploadedCandidates = new ArrayList<>();
        for (MultipartFile file : files) {
            TripMemoryStorageService.UploadedMemoryCandidate uploaded =
                    tripMemoryStorageService.uploadSingleFile(tripId, file, "memory.500.storage");
            uploadedCandidates.add(uploaded);
        }

        try {
            tripRepository.findByIdForUpdate(tripId)
                    .orElseThrow(() -> new NotFoundException("trip.404"));

            TripAlbum lockedAlbum = tripAlbumRepository.findByTripIdForUpdate(tripId)
                    .orElseThrow(() -> new NotFoundException("album.404"));

            long currentTotalSize = tripMemoryRepository.sumSizeBytesByTripId(tripId);
            tripMemoryPolicyService.assertTripQuotaWithinLimit(currentTotalSize + totalRequestSize);

            List<TripMemory> newMemoryEntities = uploadedCandidates.stream()
                    .map(candidate -> tripMemoryStorageService.toEntity(lockedAlbum, currentUser, candidate))
                    .toList();

            List<TripMemory> savedEntities = tripMemoryRepository.saveAll(newMemoryEntities);
            tripMemoryRepository.flush();

            List<TripMemoryDto> items = savedEntities.stream()
                    .map(tripMemoryUrlService::toDtoWithSignedUrl)
                    .toList();

            return CreateTripMemoryResponse.builder()
                    .createdCount(items.size())
                    .items(items)
                    .build();
        } catch (MainException ex) {
            tripMemoryStorageService.cleanupUploadedObjects(uploadedCandidates);
            throw ex;
        } catch (RuntimeException ex) {
            tripMemoryStorageService.cleanupUploadedObjects(uploadedCandidates);
            throw new ServerErrorException("memory.500.storage");
        }
    }

    public TripMemoryListResponse listMemories(
            Integer tripId,
            List<String> extensions,
            Integer limit,
            String cursor,
            User currentUser
    ) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        TripAlbum album = tripAlbumRepository.findByTripId(tripId)
                .orElseThrow(() -> new NotFoundException("album.404"));

        int pageSize = tripMemoryPolicyService.validateAndResolveLimit(limit);
        TripMemoryCursorService.CursorPayload cursorPayload = tripMemoryCursorService.decode(cursor);

        List<String> normalizedExtensions = tripMemoryPolicyService.normalizeAndValidateFilterExtensions(extensions);
        boolean extensionsEmpty = normalizedExtensions.isEmpty();
        List<String> queryExtensions = extensionsEmpty ? List.of("__none__") : normalizedExtensions;

        List<TripMemory> results;
        if (cursorPayload == null) {
            results = tripMemoryRepository.findPageWithoutCursor(
                    album.getId(),
                    queryExtensions,
                    extensionsEmpty,
                    PageRequest.of(0, pageSize + 1)
            );
        } else {
            results = tripMemoryRepository.findPageWithCursor(
                    album.getId(),
                    queryExtensions,
                    extensionsEmpty,
                    cursorPayload.createdAt(),
                    cursorPayload.id(),
                    PageRequest.of(0, pageSize + 1)
            );
        }

        boolean hasNext = results.size() > pageSize;
        List<TripMemory> pageItems = hasNext ? results.subList(0, pageSize) : results;

        String nextCursor = null;
        if (hasNext && !pageItems.isEmpty()) {
            TripMemory last = pageItems.getLast();
            nextCursor = tripMemoryCursorService.encode(last.getCreatedAt(), last.getId());
        }

        List<TripMemoryDto> items = pageItems.stream()
                .map(tripMemoryUrlService::toDtoWithSignedUrl)
                .toList();

        return TripMemoryListResponse.builder()
                .items(items)
                .nextCursor(nextCursor)
                .build();
    }

    public TripMemorySignedUrlResponse getMemorySignedUrl(
            Integer tripId,
            Integer memoryId,
            String extension,
            User currentUser
    ) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        TripMemory memory = tripMemoryRepository.findByIdAndTripId(memoryId, tripId)
                .orElseThrow(() -> new NotFoundException("memory.404"));

        if (StringUtils.hasText(extension)) {
            String requestedExtension = tripMemoryPolicyService.normalizeExtensionToken(extension);
            if (!requestedExtension.equals(memory.getFileExtension())) {
                throw new NotFoundException("memory.404");
            }
        }

        return tripMemoryUrlService.toSignedUrlResponse(memory);
    }

    @Transactional
    public void bulkDeleteMemories(Integer tripId, List<Integer> memoryIds, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        List<Integer> normalizedMemoryIds = tripMemoryPolicyService.normalizeAndValidateMemoryIds(memoryIds);

        TripAlbum album = tripAlbumRepository.findByTripId(tripId)
                .orElseThrow(() -> new NotFoundException("album.404"));

        List<TripMemory> memories = tripMemoryRepository.findAllByAlbumIdAndIds(album.getId(), normalizedMemoryIds);
        if (memories.size() != normalizedMemoryIds.size()) {
            throw new NotFoundException("memory.404");
        }

        for (TripMemory memory : memories) {
            tripMemoryStorageService.deleteObjectOrThrow(memory.getObjectKey(), "memory.500.storage");
        }

        tripMemoryRepository.deleteAll(memories);
    }
}
