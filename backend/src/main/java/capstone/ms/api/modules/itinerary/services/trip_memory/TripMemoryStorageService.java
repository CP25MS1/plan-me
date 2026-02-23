package capstone.ms.api.modules.itinerary.services.trip_memory;

import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.common.files.services.ObjectStorageOperationException;
import capstone.ms.api.common.files.services.ObjectStorageService;
import capstone.ms.api.modules.itinerary.entities.memory.TripAlbum;
import capstone.ms.api.modules.itinerary.entities.memory.TripMemory;
import capstone.ms.api.modules.itinerary.entities.memory.TripMemoryType;
import capstone.ms.api.modules.user.entities.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripMemoryStorageService {
    private final ObjectStorageService objectStorageService;
    private final TripMemoryPolicyService tripMemoryPolicyService;

    public UploadedMemoryCandidate uploadSingleFile(Integer tripId, MultipartFile file, String failureMessageKey) {
        tripMemoryPolicyService.validateSingleFile(file);

        String extension = tripMemoryPolicyService.extractAndNormalizeExtension(file.getOriginalFilename());
        TripMemoryType memoryType = tripMemoryPolicyService.resolveMemoryType(extension);
        String objectKey = generateObjectKey(tripId, extension);
        String contentType = tripMemoryPolicyService.resolveContentType(file);

        try (InputStream inputStream = file.getInputStream()) {
            objectStorageService.putObject(objectKey, inputStream, file.getSize(), contentType);

            return UploadedMemoryCandidate.builder()
                    .objectKey(objectKey)
                    .originalFilename(file.getOriginalFilename())
                    .fileExtension(extension)
                    .contentType(contentType)
                    .memoryType(memoryType)
                    .sizeBytes(file.getSize())
                    .build();
        } catch (IOException | ObjectStorageOperationException ex) {
            throw new ServerErrorException(failureMessageKey);
        }
    }

    public TripMemory toEntity(TripAlbum album, User uploader, UploadedMemoryCandidate candidate) {
        TripMemory memory = new TripMemory();
        memory.setAlbum(album);
        memory.setUploader(uploader);
        memory.setObjectKey(candidate.objectKey());
        memory.setOriginalFilename(candidate.originalFilename());
        memory.setFileExtension(candidate.fileExtension());
        memory.setContentType(candidate.contentType());
        memory.setMemoryType(candidate.memoryType());
        memory.setSizeBytes(candidate.sizeBytes());
        return memory;
    }

    public void cleanupUploadedObjects(List<UploadedMemoryCandidate> uploadedCandidates) {
        for (UploadedMemoryCandidate uploadedCandidate : uploadedCandidates) {
            try {
                objectStorageService.deleteObject(uploadedCandidate.objectKey());
            } catch (ObjectStorageOperationException ex) {
                log.warn("Failed to cleanup uploaded object '{}': {}", uploadedCandidate.objectKey(), ex.getMessage());
            }
        }
    }

    public void deleteObjectOrThrow(String objectKey, String failureMessageKey) {
        try {
            objectStorageService.deleteObject(objectKey);
        } catch (ObjectStorageOperationException ex) {
            throw new ServerErrorException(failureMessageKey);
        }
    }

    private String generateObjectKey(Integer tripId, String extension) {
        String datePath = LocalDate.now(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("yyyy/MM"));
        return "trips/%d/memories/%s/%s.%s".formatted(tripId, datePath, UUID.randomUUID(), extension);
    }

    @lombok.Builder
    public record UploadedMemoryCandidate(
            String objectKey,
            String originalFilename,
            String fileExtension,
            String contentType,
            TripMemoryType memoryType,
            long sizeBytes
    ) {
    }
}
