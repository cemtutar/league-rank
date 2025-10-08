'use client';

import { useState } from 'react';
import clsx from 'clsx';

type PlayerSummary = {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
  matches: Array<{
    matchId: string;
    kills: number;
    deaths: number;
    assists: number;
    championId: number;
    queueId: number;
    duration: number;
    playedAt: string;
  }>;
};

export default function HomePage() {
  const [region, setRegion] = useState('americas');
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [summary, setSummary] = useState<PlayerSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const resolveResponse = await fetch('/api/players/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName, tagLine, region })
      });

      if (!resolveResponse.ok) {
        throw new Error('Player not found');
      }

      const { puuid } = await resolveResponse.json();
      const summaryResponse = await fetch(`/api/players/${puuid}/summary?region=${encodeURIComponent(region)}`);

      if (!summaryResponse.ok) {
        throw new Error('Unable to load summary');
      }

      const data = (await summaryResponse.json()) as PlayerSummary;
      setSummary(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={gameName}
            onChange={(event) => setGameName(event.target.value)}
            placeholder="Game Name"
            required
            className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
          <input
            value={tagLine}
            onChange={(event) => setTagLine(event.target.value)}
            placeholder="Tag Line"
            required
            className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
        </div>
        <select
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-accent focus:outline-none"
        >
          <option value="americas">Americas</option>
          <option value="europe">Europe</option>
          <option value="asia">Asia</option>
          <option value="sea">SEA</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className={clsx(
            'rounded bg-accent px-3 py-2 font-semibold text-slate-900 transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-slate-950',
            loading && 'cursor-not-allowed opacity-60'
          )}
        >
          {loading ? 'Loading…' : 'Track Player'}
        </button>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </form>
      {summary ? (
        <article className="space-y-4 rounded-lg border border-slate-700 bg-slate-900/40 p-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{summary.gameName}#{summary.tagLine}</h2>
            <p className="text-sm text-gray-300 uppercase tracking-wide">{summary.region}</p>
          </div>
          <div className="space-y-3">
            {summary.matches.length === 0 ? (
              <p className="text-gray-300">No recent ranked matches found.</p>
            ) : (
              summary.matches.map((match) => (
                <div key={match.matchId} className="flex flex-col gap-1 rounded border border-slate-700 bg-slate-950/60 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{match.matchId}</span>
                    <span>{new Date(match.playedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-200">
                    <span>K/D/A: {match.kills}/{match.deaths}/{match.assists}</span>
                    <span>Champion: {match.championId}</span>
                    <span>Queue: {match.queueId}</span>
                    <span>{Math.round(match.duration / 60)}m</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      ) : null}
    </section>
  );
}
