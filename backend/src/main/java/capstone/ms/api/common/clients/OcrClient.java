package capstone.ms.api.common.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@FeignClient(name = "ocr-client", url = "${ocr.service.url}")
public interface OcrClient {

    @PostMapping("/pdf")
    Map<Integer, String> extractTextFromPdf(@RequestParam String taskType, @RequestPart("files") MultipartFile[] files);

    @PostMapping("/image")
    Map<Integer, String> extractTextFromImage(@RequestParam String taskType, @RequestPart("files") MultipartFile[] files);
}
