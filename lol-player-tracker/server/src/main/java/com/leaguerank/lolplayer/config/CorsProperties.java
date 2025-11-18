package com.leaguerank.lolplayer.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@ConfigurationProperties(prefix = "cors")
public class CorsProperties {

    private String allowOrigin;

    public String getAllowOrigin() {
        return allowOrigin;
    }

    public void setAllowOrigin(String allowOrigin) {
        this.allowOrigin = allowOrigin;
    }

    public List<String> getOrigins() {
        if (allowOrigin == null || allowOrigin.isBlank()) {
            return List.of("*");
        }
        return Arrays.stream(allowOrigin.split(","))
            .map(String::trim)
            .filter(value -> !value.isEmpty())
            .collect(Collectors.toList());
    }
}
