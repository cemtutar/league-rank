package com.leaguerank.lolplayer.dto;

import java.time.Instant;

public class MatchSummaryDto {

    private String matchId;
    private int kills;
    private int deaths;
    private int assists;
    private int championId;
    private int queueId;
    private int duration;
    private Instant playedAt;
    private ChampionDetailsDto champion;

    public MatchSummaryDto(String matchId, int kills, int deaths, int assists, int championId, int queueId,
                           int duration, Instant playedAt, ChampionDetailsDto champion) {
        this.matchId = matchId;
        this.kills = kills;
        this.deaths = deaths;
        this.assists = assists;
        this.championId = championId;
        this.queueId = queueId;
        this.duration = duration;
        this.playedAt = playedAt;
        this.champion = champion;
    }

    public String getMatchId() {
        return matchId;
    }

    public int getKills() {
        return kills;
    }

    public int getDeaths() {
        return deaths;
    }

    public int getAssists() {
        return assists;
    }

    public int getChampionId() {
        return championId;
    }

    public int getQueueId() {
        return queueId;
    }

    public int getDuration() {
        return duration;
    }

    public Instant getPlayedAt() {
        return playedAt;
    }

    public ChampionDetailsDto getChampion() {
        return champion;
    }
}
