package com.leaguerank.lolplayer.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leaguerank.lolplayer.config.RiotClientProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class RiotApiClient {

    private static final Logger log = LoggerFactory.getLogger(RiotApiClient.class);

    private static final Map<String, String> REGIONAL_HOST = Map.of(
        "americas", "americas",
        "europe", "europe",
        "asia", "asia",
        "sea", "sea"
    );

    private final RiotClientProperties properties;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RiotApiClient(RiotClientProperties properties) {
        this.properties = properties;
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    }

    public JsonNode resolveAccount(String gameName, String tagLine, String region) {
        String host = getRegionalHost(region);
        String url = String.format(
            "https://%s.api.riotgames.com/riot/account/v1/accounts/by-riot-id/%s/%s",
            host, encode(gameName), encode(tagLine)
        );
        return sendRequest(url);
    }

    public List<String> fetchMatchIds(String puuid, String region, int count) {
        String host = getRegionalHost(region);
        String url = String.format(
            "https://%s.api.riotgames.com/lol/match/v5/matches/by-puuid/%s/ids?type=ranked&count=%d",
            host, encode(puuid), count
        );
        JsonNode body = sendRequest(url);
        List<String> ids = new ArrayList<>();
        if (body.isArray()) {
            body.forEach(node -> ids.add(node.asText()));
        }
        return ids;
    }

    public JsonNode fetchMatch(String matchId, String region) {
        String host = getRegionalHost(region);
        String url = String.format(
            "https://%s.api.riotgames.com/lol/match/v5/matches/%s",
            host, encode(matchId)
        );
        return sendRequest(url);
    }

    private JsonNode sendRequest(String url) {
        ensureApiKey();
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
            .GET()
            .timeout(Duration.ofSeconds(30))
            .header(HttpHeaders.ACCEPT, "application/json")
            .header("X-Riot-Token", properties.getApiKey())
            .header(HttpHeaders.USER_AGENT, "LoLPlayerTracker/1.0 (+https://example.com)")
            .build();

        HttpResponse<String> response = executeWithRetry(request, 0);
        try {
            return objectMapper.readTree(response.body());
        } catch (IOException e) {
            throw new IllegalStateException("Unable to read Riot API response", e);
        }
    }

    private HttpResponse<String> executeWithRetry(HttpRequest request, int attempt) {
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int statusCode = response.statusCode();

            if (statusCode == HttpStatus.TOO_MANY_REQUESTS.value() && attempt == 0) {
                long retryAfter = parseRetryAfter(response.headers().firstValue("Retry-After"));
                log.warn("Riot API rate limited. Retrying in {}s", retryAfter);
                sleep(Duration.ofSeconds(retryAfter));
                return executeWithRetry(request, attempt + 1);
            }

            if (statusCode >= 500 && statusCode < 600 && attempt == 0) {
                log.warn("Riot API {} server error. Retrying shortly.", statusCode);
                sleep(Duration.ofMillis(500));
                return executeWithRetry(request, attempt + 1);
            }

            if (statusCode >= 200 && statusCode < 300) {
                return response;
            }

            String hint = statusCode == HttpStatus.FORBIDDEN.value()
                ? "Forbidden. Check RIOT_API_KEY validity."
                : "";
            throw new IllegalStateException(
                "Riot API request failed: " + statusCode + " " + hint + " body=" + response.body());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Riot API request interrupted", e);
        } catch (IOException e) {
            throw new IllegalStateException("Riot API request failed", e);
        }
    }

    private long parseRetryAfter(Optional<String> header) {
        return header.map(Long::parseLong).orElse(2L);
    }

    private void sleep(Duration duration) {
        try {
            Thread.sleep(duration.toMillis());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private String getRegionalHost(String region) {
        String host = REGIONAL_HOST.get(region.toLowerCase());
        if (host == null) {
            throw new IllegalArgumentException("Unsupported region: " + region);
        }
        return host;
    }

    private void ensureApiKey() {
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            throw new IllegalStateException("RIOT_API_KEY is not configured");
        }
    }

    // Encode for path segments: spaces -> %20 instead of +
    private String encode(String value) {
        String encoded = URLEncoder.encode(value, StandardCharsets.UTF_8);
        return encoded.replace("+", "%20");
    }
}
