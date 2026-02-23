package capstone.ms.api.modules.itinerary.services.trip_memory;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.files.properties.MediaValidationProperties;
import capstone.ms.api.modules.itinerary.entities.memory.TripMemoryType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TripMemoryPolicyService {
    private static final int DEFAULT_LIMIT = 30;
    private static final int MAX_LIMIT = 100;

    private final MediaValidationProperties mediaValidationProperties;

    public void validateUploadRequest(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("memory.400", "memory.400.files.empty");
        }
    }

    public void validateSingleFile(MultipartFile file) {
        if (file == null || file.isEmpty() || !StringUtils.hasText(file.getOriginalFilename())) {
            throw new BadRequestException("memory.400", "memory.400.files.empty");
        }

        long maxFileSize = mediaValidationProperties.getMaxFileSize().toBytes();
        if (file.getSize() > maxFileSize) {
            throw new BadRequestException("memory.400", "memory.400.file.maxSize");
        }
    }

    public void assertRequestSizeWithinLimit(long totalRequestSize) {
        long maxRequestSize = mediaValidationProperties.getMaxRequestSize().toBytes();
        if (totalRequestSize > maxRequestSize) {
            throw new BadRequestException("memory.400", "memory.400.request.maxSize");
        }
    }

    public void assertTripQuotaWithinLimit(long totalTripSizeAfterUpload) {
        long maxTripSize = mediaValidationProperties.getMaxTripTotalSize().toBytes();
        if (totalTripSizeAfterUpload > maxTripSize) {
            throw new BadRequestException("memory.400", "memory.400.tripQuotaExceeded");
        }
    }

    public List<String> normalizeAndValidateFilterExtensions(List<String> extensions) {
        if (extensions == null || extensions.isEmpty()) {
            return List.of();
        }

        Set<String> allowList = allAllowedExtensions();
        Set<String> normalized = new LinkedHashSet<>();

        for (String extension : extensions) {
            if (!StringUtils.hasText(extension)) {
                throw new BadRequestException("memory.400", "memory.400.extension.invalid");
            }

            String normalizedExtension = normalizeExtensionToken(extension);
            if (!allowList.contains(normalizedExtension)) {
                throw new BadRequestException("memory.400", "memory.400.extension.invalid");
            }

            normalized.add(normalizedExtension);
        }

        return normalized.stream().toList();
    }

    public TripMemoryType resolveMemoryType(String extension) {
        if (normalizedExtensions(mediaValidationProperties.getAllowedImageExtensions()).contains(extension)) {
            return TripMemoryType.IMAGE;
        }
        if (normalizedExtensions(mediaValidationProperties.getAllowedVideoExtensions()).contains(extension)) {
            return TripMemoryType.VIDEO;
        }
        throw new BadRequestException("memory.400", "memory.400.extension.invalid");
    }

    public String extractAndNormalizeExtension(String filename) {
        if (!StringUtils.hasText(filename) || !filename.contains(".")) {
            throw new BadRequestException("memory.400", "memory.400.extension.invalid");
        }

        String extension = filename.substring(filename.lastIndexOf('.') + 1);
        String normalized = normalizeExtensionToken(extension);

        if (!allAllowedExtensions().contains(normalized)) {
            throw new BadRequestException("memory.400", "memory.400.extension.invalid");
        }

        return normalized;
    }

    public int validateAndResolveLimit(Integer limit) {
        int resolved = limit == null ? DEFAULT_LIMIT : limit;
        if (resolved < 1 || resolved > MAX_LIMIT) {
            throw new BadRequestException("memory.400", "memory.400.limit.invalid");
        }
        return resolved;
    }

    public String resolveContentType(MultipartFile file) {
        if (StringUtils.hasText(file.getContentType())) {
            return file.getContentType();
        }
        return "application/octet-stream";
    }

    public String normalizeExtensionToken(String extensionToken) {
        String trimmed = extensionToken.trim().toLowerCase(Locale.ROOT);
        if (trimmed.startsWith(".")) {
            return trimmed.substring(1);
        }
        return trimmed;
    }

    public List<Integer> normalizeAndValidateMemoryIds(List<Integer> memoryIds) {
        if (memoryIds == null || memoryIds.isEmpty()) {
            throw new BadRequestException("memory.400", "memory.400.memoryIds.empty");
        }

        LinkedHashSet<Integer> normalized = new LinkedHashSet<>();
        for (Integer memoryId : memoryIds) {
            if (memoryId == null || memoryId <= 0) {
                throw new BadRequestException("memory.400", "memory.400.memoryIds.invalid");
            }
            normalized.add(memoryId);
        }

        return normalized.stream().toList();
    }

    private Set<String> allAllowedExtensions() {
        Set<String> extensions = new LinkedHashSet<>();
        extensions.addAll(normalizedExtensions(mediaValidationProperties.getAllowedImageExtensions()));
        extensions.addAll(normalizedExtensions(mediaValidationProperties.getAllowedVideoExtensions()));
        return extensions;
    }

    private Set<String> normalizedExtensions(List<String> extensions) {
        if (extensions == null) {
            return Set.of();
        }

        Set<String> normalized = new LinkedHashSet<>();
        for (String extension : extensions) {
            if (StringUtils.hasText(extension)) {
                normalized.add(normalizeExtensionToken(extension));
            }
        }
        return normalized;
    }
}
