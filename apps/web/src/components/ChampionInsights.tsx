import { Champion } from "../types";

interface ChampionInsightsProps {
  champions: Champion[];
  featured: Champion[];
}

const ChampionInsights = ({ champions, featured }: ChampionInsightsProps) => (
  <div className="card">
    <header className="card-header">
      <h2>Champion insights</h2>
      <p>Compare win rates, pick trends, and popular builds.</p>
    </header>
    <div className="featured-champions">
      {featured.map((champion) => (
        <div key={champion.id} className="featured-champion">
          <h3>{champion.name}</h3>
          <p>
            {champion.role} · Tier {champion.tier} · {champion.winRate}% win rate
          </p>
          <div>
            <h4>Signature build</h4>
            <ul className="chip-list">
              {champion.bestBuild.map((item) => (
                <li key={item} className="chip">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
    <table className="champion-table">
      <thead>
        <tr>
          <th>Champion</th>
          <th>Role</th>
          <th>Tier</th>
          <th>Win rate</th>
          <th>Pick rate</th>
          <th>Ban rate</th>
          <th>Matches</th>
        </tr>
      </thead>
      <tbody>
        {champions.map((champion) => (
          <tr key={champion.id}>
            <td>{champion.name}</td>
            <td>{champion.role}</td>
            <td>{champion.tier}</td>
            <td>{champion.winRate}%</td>
            <td>{champion.pickRate}%</td>
            <td>{champion.banRate}%</td>
            <td>{champion.matchesAnalyzed.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ChampionInsights;
