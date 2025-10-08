import express from "express";
import cors from "cors";
import { championStats, metaTrends } from "./data/champions.js";
import { playerProfiles } from "./data/players.js";
import { calculateGlobalMetrics, findPlayerProfile } from "./utils/metrics.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

app.get("/api/champions", (_, res) => {
  res.json({ champions: championStats });
});

app.get("/api/meta", (_, res) => {
  res.json({ metaTrends });
});

app.get("/api/players", (_, res) => {
  res.json({ players: playerProfiles });
});

app.get("/api/players/:summonerName", (req, res) => {
  const { summonerName } = req.params;
  const player = findPlayerProfile(summonerName);

  if (!player) {
    res.status(404).json({ message: `No data available for ${summonerName}` });
    return;
  }

  res.json({ player });
});

app.get("/api/metrics", (_, res) => {
  const metrics = calculateGlobalMetrics();
  res.json({ metrics });
});

app.listen(PORT, () => {
  console.log(`League Rank analytics API listening on port ${PORT}`);
});
