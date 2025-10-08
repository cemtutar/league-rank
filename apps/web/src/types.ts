import type { ChampionApi, MetaApi, PlayerApi } from "./api";

export type Champion = ChampionApi & {
  impactScore?: number;
};

export type PlayerProfile = PlayerApi & {
  kda?: number;
};

export type GlobalMetrics = {
  totalMatches: number;
  averageWinRate: number;
  topTierCount: number;
  roleDistribution: Record<string, number>;
  playerWinRate: { summonerName: string; winRate: number; matches: number }[];
};

export type MetaSnapshot = MetaApi;
