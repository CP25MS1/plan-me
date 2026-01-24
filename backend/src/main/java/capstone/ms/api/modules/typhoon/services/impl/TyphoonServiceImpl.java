package capstone.ms.api.modules.typhoon.services.impl;

import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.typhoon.configs.TyphoonProps;
import capstone.ms.api.modules.typhoon.dto.ChatMessage;
import capstone.ms.api.modules.typhoon.dto.ChatRequest;
import capstone.ms.api.modules.typhoon.services.TyphoonService;
import com.google.gson.JsonParser;
import com.openai.client.OpenAIClient;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import com.openai.models.chat.completions.ChatCompletionMessageParam;
import lombok.AllArgsConstructor;
import okhttp3.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@AllArgsConstructor
public class TyphoonServiceImpl implements TyphoonService {
    private final OpenAIClient typhoonBaseClient;
    private final TyphoonProps typhoonProps;
    private final OkHttpClient ocrClient = new OkHttpClient();

    @Override
    public Flux<String> streamChat(ChatRequest req) {
        return Mono.fromCallable(() -> {
                    List<ChatCompletionMessageParam> sdkMessages = toSdkMessages(req);

                    ChatCompletionCreateParams params = buildCreateParams(req, sdkMessages);
                    Object resp = typhoonBaseClient.chat().completions().create(params);
                    String content = extractContentFromResponse(resp);
                    return content == null ? "" : content;
                })
                .subscribeOn(Schedulers.boundedElastic())
                .flatMapMany(Flux::just);
    }

    private List<ChatCompletionMessageParam> toSdkMessages(ChatRequest req) {
        if (req == null || req.messages() == null || req.messages().isEmpty()) {
            throw new ServerErrorException("reservation.email.500");
        }

        return req.messages().stream()
                .map(this::toSdkMessage)
                .toList();
    }

    private ChatCompletionCreateParams buildCreateParams(ChatRequest req, List<ChatCompletionMessageParam> sdkMessages) {
        return ChatCompletionCreateParams.builder()
                .model(ChatModel.of(req == null || req.model() == null
                        ? "typhoon-v2.5-30b-a3b-instruct"
                        : req.model()))
                .messages(sdkMessages)
                .temperature(req == null || req.temperature() == null ? 0.7 : req.temperature())
                .maxCompletionTokens(req == null || req.maxTokens() == null ? 2048 : req.maxTokens())
                .topP(req == null || req.topP() == null ? 0.9 : req.topP())
                .frequencyPenalty(req == null || req.frequencyPenalty() == null ? 0.0 : req.frequencyPenalty())
                .build();
    }

    private ChatCompletionMessageParam toSdkMessage(ChatMessage m) {
        String role = (m == null || m.role() == null) ? "user" : m.role().toLowerCase();
        String content = (m == null || m.content() == null) ? "" : m.content();

        if ("system".equals(role)) {
            return ChatCompletionMessageParam.ofSystem(
                    com.openai.models.chat.completions.ChatCompletionSystemMessageParam.builder()
                            .content(content)
                            .build()
            );
        } else if ("assistant".equals(role)) {
            return ChatCompletionMessageParam.ofAssistant(
                    com.openai.models.chat.completions.ChatCompletionAssistantMessageParam.builder()
                            .content(content)
                            .build()
            );
        } else {
            return ChatCompletionMessageParam.ofUser(
                    com.openai.models.chat.completions.ChatCompletionUserMessageParam.builder()
                            .content(content)
                            .build()
            );
        }
    }

    private String extractContentFromResponse(Object resp) {
        if (resp == null) return "";

        try {
            Object choicesObj = tryAnyMethod(resp, "choices", "getChoices");
            if (choicesObj == null) return "";

            Object firstChoice = null;
            if (choicesObj instanceof List<?> choicesList) {
                if (choicesList.isEmpty()) return "";
                firstChoice = choicesList.getFirst();
            } else {
                firstChoice = tryAnyMethod(choicesObj, "getFirst", "peekFirst", "first");
                if (firstChoice == null) {
                    Object iterator = tryAnyMethod(choicesObj, "iterator");
                    if (iterator instanceof Iterator<?> it && it.hasNext()) firstChoice = it.next();

                }
            }

            if (firstChoice == null) return "";

            Object messageObj = tryAnyMethod(firstChoice, "message", "getMessage");
            if (messageObj != null) {
                Object contentObj = tryAnyMethod(messageObj, "content", "getContent");
                if (contentObj instanceof Optional) {
                    return ((Optional<?>) contentObj).map(Object::toString).orElse("");
                } else if (contentObj != null) {
                    return contentObj.toString();
                }
            }

            Object textObj = tryAnyMethod(firstChoice, "text", "getText");
            if (textObj != null) return textObj.toString();

        } catch (Exception e) {
            return "";
        }

        return "";
    }

    private Object tryAnyMethod(Object target, String... methodNames) {
        if (target == null) return null;
        for (String name : methodNames) {
            try {
                Method m = target.getClass().getMethod(name);
                Object res = m.invoke(target);
                if (res != null) return res;
            } catch (Exception ignored) {
                // try next
            }
        }
        return null;
    }

    @Override
    public String ocr(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            MediaType mediaType = MediaType.parse(contentType != null ? contentType : "application/octet-stream");
            byte[] bytes = file.getBytes();

            RequestBody fileBody = RequestBody.create(bytes, mediaType);

            RequestBody requestBody = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("file", Objects.requireNonNullElse(file.getOriginalFilename(), "file"), fileBody)
                    .addFormDataPart("model", "typhoon-ocr-preview")
                    .addFormDataPart("task_type", "default")
                    .addFormDataPart("max_tokens", "16384")
                    .addFormDataPart("temperature", "0.1")
                    .addFormDataPart("top_p", "0.6")
                    .addFormDataPart("repetition_penalty", "1.2")
                    .build();

            Request request = new Request.Builder()
                    .url(typhoonProps.getOcrApiUrl())
                    .addHeader("Authorization", "Bearer " + typhoonProps.getApiKey())
                    .post(requestBody)
                    .build();

            try (Response response = ocrClient.newCall(request).execute()) {
                String bodyString = response.body().string();
                if (response.isSuccessful()) {
                    var json = JsonParser.parseString(bodyString);
                    var contentObj = json.getAsJsonObject().get("results").getAsJsonArray().get(0)
                            .getAsJsonObject().get("message")
                            .getAsJsonObject()
                            .get("choices").getAsJsonArray().get(0)
                            .getAsJsonObject().get("message")
                            .getAsJsonObject().get("content");
                    return contentObj.getAsString();
                }
            }
        } catch (IOException e) {
            //
        }
        return "";
    }
}
