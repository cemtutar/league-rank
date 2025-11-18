package com.leaguerank.lolplayer.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "lol")
public class LolProperties {

    private String championDataUrl;

    public String getChampionDataUrl() {
        return championDataUrl;
    }

    public void setChampionDataUrl(String championDataUrl) {
        this.championDataUrl = championDataUrl;
    }
}
