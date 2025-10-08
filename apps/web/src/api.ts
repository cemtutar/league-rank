const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
};

export const fetchGlobalMetrics = async () => {
  const data = await fetch(`${API_BASE_URL}/api/metrics`).then((res) => handleResponse<{ metrics: TMetrics }>(res));
  return data.metrics;
};

type TMetrics = {
  totalMatches: number;
  averageWinRate: number;
  topTierCount: number;
  roleDistribution: Record<string, number>;
  playerWinRate: { summonerName: string; winRate: number; matches: number }[];
};

export const fetchChampionStats = async () => {
  const data = await fetch(`${API_BASE_URL}/api/champions`).then((res) =>
    handleResponse<{ champions: ChampionApiResponse[] }>(res)
  );
  return data.champions;
};

type ChampionApiResponse = {
  id: number;
  name: string;
  role: string;
  tier: string;
  winRate: number;
  pickRate: number;
  banRate: number;
  matchesAnalyzed: number;
  bestBuild: string[];
  skillPriority: string[];
  counters: { name: string; threat: number }[];
};

export const fetchPlayers = async () => {
  const data = await fetch(`${API_BASE_URL}/api/players`).then((res) =>
    handleResponse<{ players: PlayerApiResponse[] }>(res)
  );
  return data.players;
};

type PlayerApiResponse = {
  summonerName: string;
  rank: string;
  lp: number;
  mainRole: string;
  secondaryRole: string;
  championPool: string[];
  matchesAnalyzed: number;
  wins: number;
  losses: number;
  killParticipation: number;
  averageGold: number;
  averageVisionScore: number;
  recentPerformance: { champion: string; result: string; kda: string; cs: number }[];
};

export const fetchPlayer = async (summonerName: string) => {
  if (!summonerName) return null;
  const data = await fetch(`${API_BASE_URL}/api/players/${encodeURIComponent(summonerName)}`).then((res) =>
    handleResponse<{ player: PlayerApiResponse }>(res)
  );
  return data.player;
};

export const fetchMeta = async () => {
  const data = await fetch(`${API_BASE_URL}/api/meta`).then((res) =>
    handleResponse<{ metaTrends: MetaApiResponse[] }>(res)
  );
  return data.metaTrends;
};

type MetaApiResponse = {
  patch: string;
  highlights: string[];
  roles: Record<string, { mostContested: string; emerging: string }>;
};

export type { ChampionApiResponse as ChampionApi, PlayerApiResponse as PlayerApi, MetaApiResponse as MetaApi };
