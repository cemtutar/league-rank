package com.leaguerank.lolplayer.repository;

import com.leaguerank.lolplayer.entity.PlayerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlayerRepository extends JpaRepository<PlayerEntity, String> {

    Optional<PlayerEntity> findByPuuid(String puuid);

    Optional<PlayerEntity> findByGameNameIgnoreCaseAndTagLineIgnoreCaseAndRegionIgnoreCase(String gameName, String tagLine, String region);
}
