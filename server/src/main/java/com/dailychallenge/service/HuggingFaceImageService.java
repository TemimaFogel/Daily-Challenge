package com.dailychallenge.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Generates challenge card images using Hugging Face Inference Providers (router) API (text-to-image).
 * Uses https://router.huggingface.co/hf-inference/models/{modelId}. Token is read from backend
 * config only (HF_TOKEN). If token is missing or generation fails, returns null so challenge
 * creation continues and the frontend shows a placeholder.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HuggingFaceImageService {

    /** Router-based inference (replaces legacy api-inference.huggingface.co). */
    private static final String ROUTER_BASE = "https://router.huggingface.co/hf-inference";
    private static final String PROMPT_PREFIX = "Create a modern minimal illustration for a daily productivity challenge. ";
    private static final String STYLE_SUFFIX = " Style: clean, colorful, friendly, flat modern app illustration, no text, no watermark, suitable for a challenge card.";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ChallengeImageService challengeImageService;

    @Value("${huggingface.api.token:}")
    private String token;

    @Value("${huggingface.api.model:black-forest-labs/FLUX.1-schnell}")
    private String modelId;

    @PostConstruct
    void logTokenStatus() {
        boolean configured = token != null && !token.isBlank();
        log.info("HuggingFace token configured: {}", configured);
        if (!configured) {
            log.info("Set HF_TOKEN environment variable (or huggingface.api.token) to enable AI-generated challenge images.");
        } else {
            log.info("Hugging Face image generation active; model: {}", modelId);
        }
    }

    /**
     * Generates an image from the challenge title and description, saves it locally,
     * and returns the stored image URL. Returns null if token is missing or the API
     * call fails (caller will assign fallback placeholder).
     */
    public String generateAndSaveChallengeImage(String title, String description) {
        if (token == null || token.isBlank()) {
            log.info("HF_TOKEN not configured – skipping AI image generation");
            return null;
        }

        log.info("Starting Hugging Face generation for challenge (title: {})", title != null ? title.substring(0, Math.min(50, title.length())) : "");

        String prompt = buildPrompt(title, description);
        byte[] imageBytes = callHuggingFaceApi(prompt);

        if (imageBytes == null || imageBytes.length == 0) {
            log.warn("Hugging Face did not return image bytes; caller will assign fallback placeholder");
            return null;
        }

        try {
            String url = challengeImageService.saveGeneratedImage(imageBytes, ".png");
            log.info("Image saved under uploads/challenge-images; url={}", url);
            return url;
        } catch (Exception e) {
            log.warn("Failed to save generated image; exact error: {}", e.getMessage(), e);
            return null;
        }
    }

    private String buildPrompt(String title, String description) {
        StringBuilder sb = new StringBuilder(PROMPT_PREFIX);
        if (title != null && !title.isBlank()) {
            sb.append("Title: ").append(title.trim().replaceAll("\\s+", " ")).append(". ");
        }
        if (description != null && !description.isBlank()) {
            String desc = description.trim().replaceAll("\\s+", " ").replaceAll("\\n", " ");
            if (desc.length() > 200) {
                desc = desc.substring(0, 200);
            }
            sb.append("Description: ").append(desc).append(". ");
        }
        sb.append(STYLE_SUFFIX);
        return sb.toString();
    }

    private byte[] callHuggingFaceApi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token.trim());
        headers.setAccept(List.of(MediaType.IMAGE_PNG));

        Map<String, String> body = Map.of("inputs", prompt);
        String url = ROUTER_BASE + "/models/" + modelId;

        try {
            log.info("Sending request to Hugging Face router (text-to-image); url={}; model={}", url, modelId);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    byte[].class
            );

            HttpStatusCode status = response.getStatusCode();
            log.info("Response received from Hugging Face router: status={} (value={})", status, status.value());

            if (!status.is2xxSuccessful()) {
                byte[] errBody = response.getBody();
                String errSnippet = errBody != null && errBody.length > 0
                        ? new String(errBody, StandardCharsets.UTF_8).substring(0, Math.min(500, errBody.length))
                        : "(empty body)";
                log.warn("Hugging Face router returned non-success: status={}, body: {}", status, errSnippet);
                return null;
            }

            byte[] bodyBytes = response.getBody();
            if (bodyBytes == null || bodyBytes.length == 0) {
                log.warn("Hugging Face API returned empty body; generation failed");
                return null;
            }
            // Router may return JSON error (e.g. "Model is loading", model not found) instead of image
            MediaType contentType = response.getHeaders().getContentType();
            if (contentType != null && contentType.includes(MediaType.APPLICATION_JSON)) {
                String snippet = new String(bodyBytes, StandardCharsets.UTF_8);
                if (snippet.length() > 400) snippet = snippet.substring(0, 400) + "...";
                log.warn("Hugging Face router returned JSON instead of image. status={}; body snippet: {}", status, snippet);
                return null;
            }

            log.info("Hugging Face generation succeeded; received {} bytes", bodyBytes.length);
            return bodyBytes;
        } catch (Exception e) {
            log.warn("Hugging Face request failed; exact error: {} cause={}", e.getMessage(), e.getCause() != null ? e.getCause().getMessage() : "none", e);
            return null;
        }
    }
}
