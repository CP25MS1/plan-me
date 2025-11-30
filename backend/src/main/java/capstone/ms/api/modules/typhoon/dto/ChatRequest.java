package capstone.ms.api.modules.typhoon.dto;


import lombok.Builder;

import java.util.List;

@Builder
public record ChatRequest(
        String model,
        List<ChatMessage> messages,
        Double temperature,
        Integer maxTokens,
        Double topP,
        Double frequencyPenalty
) {
}
