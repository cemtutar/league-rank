package com.leaguerank.lolplayer.dto;

import java.util.List;

public class PlayerSummaryResponse {

    private String puuid;
    private String gameName;
    private String tagLine;
    private String region;
    private List<MatchSummaryDto> matches;

    public PlayerSummaryResponse(String puuid, String gameName, String tagLine, String region, List<MatchSummaryDto> matches) {
        this.puuid = puuid;
        this.gameName = gameName;
        this.tagLine = tagLine;
        this.region = region;
        this.matches = matches;
    }

    public String getPuuid() {
        return puuid;
    }

    public String getGameName() {
        return gameName;
    }

    public String getTagLine() {
        return tagLine;
    }

    public String getRegion() {
        return region;
    }

    public List<MatchSummaryDto> getMatches() {
        return matches;
    }
}
