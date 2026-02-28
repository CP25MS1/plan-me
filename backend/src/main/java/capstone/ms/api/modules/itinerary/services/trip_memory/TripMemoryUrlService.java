package capstone.ms.api.modules.itinerary.services.trip_memory;

import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.common.files.properties.MediaStorageProperties;
import capstone.ms.api.common.files.services.ObjectStorageOperationException;
import capstone.ms.api.common.files.services.ObjectStorageService;
import capstone.ms.api.modules.itinerary.dto.album.TripAlbumSignedUrlItemDto;
import capstone.ms.api.modules.itinerary.dto.memory.TripMemoryDto;
import capstone.ms.api.modules.itinerary.dto.memory.TripMemorySignedUrlResponse;
import capstone.ms.api.modules.itinerary.entities.memory.TripMemory;
import capstone.ms.api.modules.itinerary.mappers.TripMemoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TripMemoryUrlService {
    private static final int DEFAULT_SIGNED_URL_TTL_SECONDS = 900;

    private final ObjectStorageService objectStorageService;
    private final MediaStorageProperties mediaStorageProperties;
    private final TripMemoryMapper tripMemoryMapper;

    public TripMemoryDto toDtoWithSignedUrl(TripMemory memory) {
        int ttl = resolveSignedUrlTtlSeconds();
        try {
            String signedUrl = objectStorageService.generateGetSignedUrl(memory.getObjectKey(), ttl);
            TripMemoryDto dto = tripMemoryMapper.toDto(memory);
            dto.setSignedUrl(signedUrl);
            dto.setSignedUrlExpiresAt(Instant.now().plusSeconds(ttl));
            return dto;
        } catch (ObjectStorageOperationException ex) {
            throw new ServerErrorException("memory.500.storage");
        }
    }

    public TripMemorySignedUrlResponse toSignedUrlResponse(TripMemory memory) {
        int ttl = resolveSignedUrlTtlSeconds();

        try {
            String signedUrl = objectStorageService.generateGetSignedUrl(memory.getObjectKey(), ttl);

            return TripMemorySignedUrlResponse.builder()
                    .memoryId(memory.getId())
                    .signedUrl(signedUrl)
                    .signedUrlExpiresAt(Instant.now().plusSeconds(ttl))
                    .build();
        } catch (ObjectStorageOperationException ex) {
            throw new ServerErrorException("memory.500.storage");
        }
    }

    public TripAlbumSignedUrlItemDto toAlbumSignedUrlItem(TripMemory memory) {
        int ttl = resolveSignedUrlTtlSeconds();

        try {
            String signedUrl = objectStorageService.generateGetSignedUrl(memory.getObjectKey(), ttl);

            return TripAlbumSignedUrlItemDto.builder()
                    .memoryId(memory.getId())
                    .originalFilename(memory.getOriginalFilename())
                    .fileExtension(memory.getFileExtension())
                    .signedUrl(signedUrl)
                    .signedUrlExpiresAt(Instant.now().plusSeconds(ttl))
                    .build();
        } catch (ObjectStorageOperationException ex) {
            throw new ServerErrorException("memory.500.storage");
        }
    }

    private int resolveSignedUrlTtlSeconds() {
        Integer configuredTtl = mediaStorageProperties.getSignedUrlTtlSeconds();
        if (configuredTtl == null || configuredTtl <= 0) {
            return DEFAULT_SIGNED_URL_TTL_SECONDS;
        }
        return configuredTtl;
    }
}
