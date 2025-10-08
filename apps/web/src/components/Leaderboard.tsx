import { clsx } from "clsx";
import { GlobalMetrics, PlayerProfile } from "../types";

interface LeaderboardProps {
  players: PlayerProfile[];
  metrics: GlobalMetrics;
  onSelectSummoner: (summoner: string) => void;
  selectedSummoner: string;
}

const Leaderboard = ({ players, metrics, onSelectSummoner, selectedSummoner }: LeaderboardProps) => (
  <div className="card">
    <header className="card-header">
      <h2>Ranked Leaderboard Snapshot</h2>
      <p>
        {metrics.totalMatches.toLocaleString()} matches analyzed · Average win rate {metrics.averageWinRate}% ·
        {" "}
        {metrics.topTierCount} champions in S tier
      </p>
    </header>
    <div className="role-distribution">
      {Object.entries(metrics.roleDistribution).map(([role, pickRate]) => (
        <div key={role} className="role-card">
          <h3>{role}</h3>
          <p>{pickRate.toFixed(1)}% pick rate</p>
        </div>
      ))}
    </div>
    <table className="leaderboard-table">
      <thead>
        <tr>
          <th>Summoner</th>
          <th>Rank</th>
          <th>Matches</th>
          <th>Win rate</th>
          <th>Main role</th>
        </tr>
      </thead>
      <tbody>
        {players.map((player) => {
          const winRateEntry = metrics.playerWinRate.find((entry) => entry.summonerName === player.summonerName);
          const winRate = winRateEntry ? `${winRateEntry.winRate}%` : "-";

          return (
            <tr
              key={player.summonerName}
              className={clsx({ selected: player.summonerName === selectedSummoner })}
              onClick={() => onSelectSummoner(player.summonerName)}
            >
              <td>{player.summonerName}</td>
              <td>{player.rank}</td>
              <td>{player.matchesAnalyzed}</td>
              <td>{winRate}</td>
              <td>{player.mainRole}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default Leaderboard;
