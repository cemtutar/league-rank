package com.leaguerank.lolplayer.controller;

import com.leaguerank.lolplayer.dto.PlayerMatchesResponse;
import com.leaguerank.lolplayer.dto.PlayerSummaryResponse;
import com.leaguerank.lolplayer.dto.ResolvePlayerRequest;
import com.leaguerank.lolplayer.dto.ResolvePlayerResponse;
import com.leaguerank.lolplayer.service.PlayerTrackerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@Validated
public class PlayerController {

    private final PlayerTrackerService playerTrackerService;

    public PlayerController(PlayerTrackerService playerTrackerService) {
        this.playerTrackerService = playerTrackerService;
    }

    @PostMapping("/players/resolve")
    public ResolvePlayerResponse resolvePlayer(@Valid @RequestBody ResolvePlayerRequest request) {
        return playerTrackerService.resolvePlayer(request);
    }

    @GetMapping("/players/{puuid}/matches")
    public ResponseEntity<PlayerMatchesResponse> getMatches(@PathVariable String puuid,
                                                            @RequestParam String region) {
        return ResponseEntity.ok(playerTrackerService.getRecentMatches(puuid, region));
    }

    @GetMapping("/players/{puuid}/summary")
    public ResponseEntity<PlayerSummaryResponse> getSummary(@PathVariable String puuid,
                                                            @RequestParam String region) {
        return ResponseEntity.ok(playerTrackerService.getPlayerSummary(puuid, region));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}
