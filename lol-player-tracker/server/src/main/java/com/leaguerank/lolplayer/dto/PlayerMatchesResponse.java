package com.leaguerank.lolplayer.dto;

import java.util.List;

public class PlayerMatchesResponse {

    private List<MatchSummaryDto> matches;

    public PlayerMatchesResponse(List<MatchSummaryDto> matches) {
        this.matches = matches;
    }

    public List<MatchSummaryDto> getMatches() {
        return matches;
    }
}
