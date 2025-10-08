import { MetaSnapshot } from "../types";

const MetaTrends = ({ snapshots }: { snapshots: MetaSnapshot[] }) => (
  <div className="card">
    <header className="card-header">
      <h2>Meta trends</h2>
      <p>Stay ahead of the current patch and adapt your pool.</p>
    </header>
    {snapshots.map((snapshot) => (
      <div key={snapshot.patch} className="meta-snapshot">
        <h3>Patch {snapshot.patch}</h3>
        <ul className="highlights">
          {snapshot.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <div className="role-highlights">
          {Object.entries(snapshot.roles).map(([role, picks]) => (
            <div key={role}>
              <h4>{role}</h4>
              <p>
                Most contested: <strong>{picks.mostContested}</strong>
              </p>
              <p>
                Emerging pick: <strong>{picks.emerging}</strong>
              </p>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default MetaTrends;
