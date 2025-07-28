package com.example.PostApet.Service;

import com.example.PostApet.dto.ChatResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.JsonParser;
import com.google.gson.Gson;

@Slf4j
@Service
public class GeminiService {
    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Autowired
    public GeminiService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Mono<ChatResponse> generateContent(String message) {
        String requestUrl = String.format("%s?key=%s", apiUrl, apiKey);

        return webClient.post()
                .uri(requestUrl)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(createRequestPayload(message))
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parseResponse)
                .onErrorResume(e -> {
                    log.error("Gemini API error", e);
                    return Mono.just(new ChatResponse("", false, "Service unavailable. Please try again later."));
                });
    }

    private String createRequestPayload(String message) {
        JsonObject requestBody = new JsonObject();
        JsonArray contentsArray = new JsonArray();
        JsonObject contentItem = new JsonObject();
        JsonArray partsArray = new JsonArray();
        JsonObject part = new JsonObject();

        part.addProperty("text", "You are a pet adoption assistant. Answer concisely: " + message);
        partsArray.add(part);
        contentItem.add("parts", partsArray);
        contentsArray.add(contentItem);
        requestBody.add("contents", contentsArray);

        JsonObject generationConfig = new JsonObject();
        generationConfig.addProperty("temperature", 0.7);
        generationConfig.addProperty("maxOutputTokens", 500);
        requestBody.add("generationConfig", generationConfig);

        return new Gson().toJson(requestBody);
    }

    private ChatResponse parseResponse(String jsonResponse) {
        try {
            JsonObject jsonObject = JsonParser.parseString(jsonResponse).getAsJsonObject();
            String text = jsonObject.getAsJsonArray("candidates")
                    .get(0).getAsJsonObject()
                    .getAsJsonObject("content")
                    .getAsJsonArray("parts")
                    .get(0).getAsJsonObject()
                    .get("text").getAsString();
            return new ChatResponse(text, true, null);
        } catch (Exception e) {
            log.error("Error parsing Gemini response", e);
            return new ChatResponse("", false, "Error processing AI response");
        }
    }
}