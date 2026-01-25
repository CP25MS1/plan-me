package capstone.ms.api.modules.typhoon.services;

import capstone.ms.api.modules.typhoon.dto.ChatRequest;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

public interface TyphoonService {
    Flux<String> streamChat(ChatRequest req);
    String ocr(MultipartFile file);
    String ocr(byte[] fileBytes, String filename);
}
