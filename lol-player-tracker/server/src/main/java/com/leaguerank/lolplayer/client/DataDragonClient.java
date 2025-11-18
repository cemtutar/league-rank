package com.leaguerank.lolplayer.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leaguerank.lolplayer.config.LolProperties;
import com.leaguerank.lolplayer.dto.ChampionDetailsDto;
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
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class DataDragonClient {

    private static final Logger log = LoggerFactory.getLogger(DataDragonClient.class);
    private static final Duration CACHE_TTL = Duration.ofHours(1);

    private final LolProperties lolProperties;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<Integer, ChampionDetailsDto> cache = new ConcurrentHashMap<>();
    private Instant lastFetch = Instant.EPOCH;

    public DataDragonClient(LolProperties lolProperties) {
        this.lolProperties = lolProperties;
    }

    public ChampionDetailsDto getChampion(int championId) {
        refreshIfNecessary();
        return cache.getOrDefault(
            championId,
            new ChampionDetailsDto(championId, "Unknown Champion", null)
        );
    }

    private synchronized void refreshIfNecessary() {
        if (Instant.now().isBefore(lastFetch.plus(CACHE_TTL))) {
            return;
        }
        HttpRequest request = HttpRequest.newBuilder(URI.create(lolProperties.getChampionDataUrl()))
            .GET()
            .header(HttpHeaders.ACCEPT, "application/json")
            .timeout(Duration.ofSeconds(15))
            .build();
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != HttpStatus.OK.value()) {
                log.warn("Unable to refresh Data Dragon cache: status={} body={}", response.statusCode(), response.body());
                return;
            }
            JsonNode root = objectMapper.readTree(response.body()).path("data");
            cache.clear();
            root.fields().forEachRemaining(entry -> {
                JsonNode value = entry.getValue();
                int id = value.path("key").asInt();
                String name = value.path("name").asText();
                String splash = String.format("https://ddragon.leagueoflegends.com/cdn/img/champion/loading/%s_0.jpg", entry.getKey());
                cache.put(id, new ChampionDetailsDto(id, name, splash));
            });
            lastFetch = Instant.now();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (IOException e) {
            log.warn("Failed to parse Data Dragon payload", e);
        }
    }
}
