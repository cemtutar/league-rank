import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchChampionStats, fetchGlobalMetrics, fetchMeta, fetchPlayer, fetchPlayers } from "./api";
import { Champion, GlobalMetrics, MetaSnapshot, PlayerProfile } from "./types";
import Layout from "./components/Layout";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import Leaderboard from "./components/Leaderboard";
import PlayerOverview from "./components/PlayerOverview";
import ChampionInsights from "./components/ChampionInsights";
import MetaTrends from "./components/MetaTrends";

const useDashboardData = () => {
  const metricsQuery = useQuery<GlobalMetrics>({ queryKey: ["metrics"], queryFn: fetchGlobalMetrics });
  const championsQuery = useQuery<Champion[]>({
    queryKey: ["champions"],
    queryFn: fetchChampionStats
  });
  const playersQuery = useQuery<PlayerProfile[]>({
    queryKey: ["players"],
    queryFn: fetchPlayers
  });
  const metaQuery = useQuery<MetaSnapshot[]>({ queryKey: ["meta"], queryFn: fetchMeta });

  return { metricsQuery, championsQuery, playersQuery, metaQuery };
};

const App = () => {
  const { metricsQuery, championsQuery, playersQuery, metaQuery } = useDashboardData();
  const [selectedSummoner, setSelectedSummoner] = useState<string>("SummonerOne");

  const playerQuery = useQuery<PlayerProfile | null>({
    queryKey: ["player", selectedSummoner],
    queryFn: () => fetchPlayer(selectedSummoner),
    enabled: Boolean(selectedSummoner)
  });

  const isLoading =
    metricsQuery.isLoading || championsQuery.isLoading || playersQuery.isLoading || metaQuery.isLoading;

  const hasError = metricsQuery.isError || championsQuery.isError || playersQuery.isError || metaQuery.isError;

  const featuredChampions = useMemo(() => {
    if (!championsQuery.data) return [];
    return [...championsQuery.data].sort((a, b) => b.winRate - a.winRate).slice(0, 3);
  }, [championsQuery.data]);

  if (isLoading) {
    return (
      <Layout>
        <LoadingState message="Crunching numbers from the Rift..." />
      </Layout>
    );
  }

  if (hasError || !metricsQuery.data || !championsQuery.data || !playersQuery.data || !metaQuery.data) {
    return (
      <Layout>
        <ErrorState message="We couldn't load the analytics feed. Try refreshing the page." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <section>
          <Leaderboard
            players={playersQuery.data}
            metrics={metricsQuery.data}
            onSelectSummoner={setSelectedSummoner}
            selectedSummoner={selectedSummoner}
          />
        </section>
        <section>
          <PlayerOverview player={playerQuery.data} isLoading={playerQuery.isLoading} />
        </section>
        <section>
          <ChampionInsights champions={championsQuery.data} featured={featuredChampions} />
        </section>
        <section>
          <MetaTrends snapshots={metaQuery.data} />
        </section>
      </div>
    </Layout>
  );
};

export default App;
