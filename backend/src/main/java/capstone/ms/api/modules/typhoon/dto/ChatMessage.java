package capstone.ms.api.modules.typhoon.dto;

import lombok.Builder;

@Builder
public record ChatMessage(String role, String content) {
}
