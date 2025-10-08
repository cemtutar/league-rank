import { championStats } from "../data/champions.js";
import { playerProfiles } from "../data/players.js";

export const calculateGlobalMetrics = () => {
  const totalMatches = championStats.reduce((sum, champ) => sum + champ.matchesAnalyzed, 0);
  const averageWinRate =
    championStats.reduce((sum, champ) => sum + champ.winRate, 0) / championStats.length;
  const topTierCount = championStats.filter((champ) => champ.tier === "S").length;

  const roleDistribution = championStats.reduce((acc, champ) => {
    acc[champ.role] = (acc[champ.role] || 0) + champ.pickRate;
    return acc;
  }, {});

  const playerWinRate = playerProfiles.map((player) => ({
    summonerName: player.summonerName,
    winRate: Number(((player.wins / (player.wins + player.losses)) * 100).toFixed(2)),
    matches: player.matchesAnalyzed
  }));

  return {
    totalMatches,
    averageWinRate: Number(averageWinRate.toFixed(2)),
    topTierCount,
    roleDistribution,
    playerWinRate
  };
};

export const findPlayerProfile = (summonerName) =>
  playerProfiles.find(
    (player) => player.summonerName.toLowerCase() === summonerName.toLowerCase()
  );
