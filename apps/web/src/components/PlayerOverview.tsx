import LoadingState from "./LoadingState";
import { PlayerProfile } from "../types";

interface PlayerOverviewProps {
  player: PlayerProfile | null | undefined;
  isLoading: boolean;
}

const PlayerOverview = ({ player, isLoading }: PlayerOverviewProps) => {
  if (isLoading) {
    return <LoadingState message="Gathering player insight..." />;
  }

  if (!player) {
    return (
      <div className="card">
        <h2>Player overview</h2>
        <p>Select a summoner to inspect their ranked performance.</p>
      </div>
    );
  }

  const totalGames = player.wins + player.losses;
  const winRate = ((player.wins / totalGames) * 100).toFixed(1);

  return (
    <div className="card">
      <header className="card-header">
        <h2>{player.summonerName}</h2>
        <p>
          {player.rank} · {player.lp} LP · {player.mainRole} main
        </p>
      </header>
      <div className="player-overview">
        <div>
          <h3>Performance summary</h3>
          <ul>
            <li>
              <strong>{totalGames}</strong> matches tracked
            </li>
            <li>
              <strong>{winRate}%</strong> win rate
            </li>
            <li>
              <strong>{player.killParticipation}%</strong> kill participation
            </li>
            <li>
              <strong>{player.averageVisionScore}</strong> average vision score
            </li>
          </ul>
        </div>
        <div>
          <h3>Champion pool</h3>
          <ul className="chip-list">
            {player.championPool.map((champion) => (
              <li key={champion} className="chip">
                {champion}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Recent matches</h3>
          <ul className="recent-matches">
            {player.recentPerformance.map((match, index) => (
              <li key={`${match.champion}-${index}`}>
                <span>
                  <strong>{match.champion}</strong> · {match.result}
                </span>
                <span>{match.kda} KDA · {match.cs} CS</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlayerOverview;
