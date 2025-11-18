package com.leaguerank.lolplayer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.leaguerank.lolplayer.client.DataDragonClient;
import com.leaguerank.lolplayer.client.RiotApiClient;
import com.leaguerank.lolplayer.dto.ChampionDetailsDto;
import com.leaguerank.lolplayer.dto.MatchSummaryDto;
import com.leaguerank.lolplayer.dto.PlayerMatchesResponse;
import com.leaguerank.lolplayer.dto.PlayerSummaryResponse;
import com.leaguerank.lolplayer.dto.ResolvePlayerRequest;
import com.leaguerank.lolplayer.dto.ResolvePlayerResponse;
import com.leaguerank.lolplayer.entity.MatchEntity;
import com.leaguerank.lolplayer.entity.PlayerEntity;
import com.leaguerank.lolplayer.repository.MatchRepository;
import com.leaguerank.lolplayer.repository.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class PlayerTrackerService {

    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;
    private final RiotApiClient riotApiClient;
    private final DataDragonClient dataDragonClient;

    public PlayerTrackerService(PlayerRepository playerRepository,
                                MatchRepository matchRepository,
                                RiotApiClient riotApiClient,
                                DataDragonClient dataDragonClient) {
        this.playerRepository = playerRepository;
        this.matchRepository = matchRepository;
        this.riotApiClient = riotApiClient;
        this.dataDragonClient = dataDragonClient;
    }

    @Transactional
    public ResolvePlayerResponse resolvePlayer(ResolvePlayerRequest request) {
        JsonNode payload = riotApiClient.resolveAccount(request.getGameName(), request.getTagLine(), request.getRegion());
        String puuid = payload.path("puuid").asText();
        String gameName = payload.path("gameName").asText(request.getGameName());
        String tagLine = payload.path("tagLine").asText(request.getTagLine());

        PlayerEntity player = playerRepository.findByPuuid(puuid)
            .orElseGet(PlayerEntity::new);

        player.setPuuid(puuid);
        player.setGameName(gameName);
        player.setTagLine(tagLine);
        player.setRegion(request.getRegion());

        playerRepository.save(player);
        return new ResolvePlayerResponse(player.getPuuid(), player.getGameName(), player.getTagLine(), player.getRegion());
    }

    @Transactional
    public PlayerMatchesResponse getRecentMatches(String puuid, String region) {
        PlayerEntity player = findPlayerOrThrow(puuid);
        List<MatchEntity> matches = syncMatchesFromRiot(player, region, 10);
        List<MatchSummaryDto> dtos = toMatchSummaries(matches);
        dtos.sort(Comparator.comparing(MatchSummaryDto::getPlayedAt).reversed());
        return new PlayerMatchesResponse(dtos);
    }

    @Transactional
    public PlayerSummaryResponse getPlayerSummary(String puuid, String region) {
        PlayerEntity player = findPlayerOrThrow(puuid);
        List<MatchEntity> matches = matchRepository.findTop10ByPlayerOrderByPlayedAtDesc(player);
        if (matches.isEmpty()) {
            matches = syncMatchesFromRiot(player, region, 10);
            matches.sort(Comparator.comparing(MatchEntity::getPlayedAt).reversed());
        }
        List<MatchSummaryDto> dtos = toMatchSummaries(matches);
        return new PlayerSummaryResponse(player.getPuuid(), player.getGameName(), player.getTagLine(), player.getRegion(), dtos);
    }

    private PlayerEntity findPlayerOrThrow(String puuid) {
        return playerRepository.findByPuuid(puuid)
            .orElseThrow(() -> new IllegalArgumentException("Player not found"));
    }

    private List<MatchEntity> syncMatchesFromRiot(PlayerEntity player, String region, int count) {
        List<String> matchIds = riotApiClient.fetchMatchIds(player.getPuuid(), region, count);
        List<MatchEntity> synced = new ArrayList<>();
        for (String matchId : matchIds) {
            JsonNode match = riotApiClient.fetchMatch(matchId, region);
            JsonNode participants = match.path("info").path("participants");
            Optional<JsonNode> participant = findParticipant(participants, player.getPuuid());
            if (participant.isEmpty()) {
                continue;
            }
            JsonNode info = match.path("info");
            JsonNode p = participant.get();
            MatchEntity entity = matchRepository.findByMatchId(matchId)
                .orElseGet(MatchEntity::new);
            entity.setMatchId(matchId);
            entity.setPlayer(player);
            entity.setKills(p.path("kills").asInt());
            entity.setDeaths(p.path("deaths").asInt());
            entity.setAssists(p.path("assists").asInt());
            entity.setChampionId(p.path("championId").asInt());
            entity.setQueueId(info.path("queueId").asInt());
            entity.setDuration(info.path("gameDuration").asInt());
            long startedAt = info.path("gameStartTimestamp").asLong();
            entity.setPlayedAt(Instant.ofEpochMilli(startedAt));
            matchRepository.save(entity);
            synced.add(entity);
        }
        return synced;
    }

    private Optional<JsonNode> findParticipant(JsonNode participants, String puuid) {
        if (participants == null || !participants.isArray()) {
            return Optional.empty();
        }
        for (JsonNode participant : participants) {
            if (puuid.equalsIgnoreCase(participant.path("puuid").asText())) {
                return Optional.of(participant);
            }
        }
        return Optional.empty();
    }

    private List<MatchSummaryDto> toMatchSummaries(List<MatchEntity> matches) {
        List<MatchSummaryDto> dtos = new ArrayList<>();
        for (MatchEntity match : matches) {
            ChampionDetailsDto champion = dataDragonClient.getChampion(match.getChampionId());
            dtos.add(new MatchSummaryDto(
                match.getMatchId(),
                match.getKills(),
                match.getDeaths(),
                match.getAssists(),
                match.getChampionId(),
                match.getQueueId(),
                match.getDuration(),
                match.getPlayedAt(),
                champion
            ));
        }
        return dtos;
    }
}
