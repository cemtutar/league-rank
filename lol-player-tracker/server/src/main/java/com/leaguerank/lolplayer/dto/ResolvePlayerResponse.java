package com.leaguerank.lolplayer.dto;

public class ResolvePlayerResponse {

    private String puuid;
    private String gameName;
    private String tagLine;
    private String region;

    public ResolvePlayerResponse(String puuid, String gameName, String tagLine, String region) {
        this.puuid = puuid;
        this.gameName = gameName;
        this.tagLine = tagLine;
        this.region = region;
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
}
