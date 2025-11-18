package com.leaguerank.lolplayer.repository;

import com.leaguerank.lolplayer.entity.MatchEntity;
import com.leaguerank.lolplayer.entity.PlayerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<MatchEntity, String> {

    List<MatchEntity> findTop10ByPlayerOrderByPlayedAtDesc(PlayerEntity player);

    Optional<MatchEntity> findByMatchId(String matchId);
}
