package com.leaguerank.lolplayer.dto;

import jakarta.validation.constraints.NotBlank;

public class ResolvePlayerRequest {

    @NotBlank
    private String gameName;

    @NotBlank
    private String tagLine;

    @NotBlank
    private String region;

    public String getGameName() {
        return gameName;
    }

    public void setGameName(String gameName) {
        this.gameName = gameName;
    }

    public String getTagLine() {
        return tagLine;
    }

    public void setTagLine(String tagLine) {
        this.tagLine = tagLine;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }
}
