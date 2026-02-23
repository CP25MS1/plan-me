package capstone.ms.api.common.files.services;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MediaStorageInitializer {
    private final ObjectStorageService objectStorageService;

    @PostConstruct
    public void initializeBucket() {
        objectStorageService.ensureBucketExists();
    }
}
