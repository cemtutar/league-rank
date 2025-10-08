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

const queueNames: Record<number, string> = {
  420: 'Ranked Solo/Duo',
  430: 'Normal Draft',
  440: 'Ranked Flex',
  450: 'ARAM',
  400: 'Normal Blind'
};

const getQueueLabel = (queueId: number) => queueNames[queueId] ?? `Queue ${queueId}`;

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));

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
    <section className="space-y-10">
      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur"
      >
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Search for a summoner</h2>
          <p className="text-sm text-slate-300">
            Enter a Riot ID to fetch their recent ranked performance across supported regions.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_0.9fr]">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-300">Game Name</span>
            <input
              value={gameName}
              onChange={(event) => setGameName(event.target.value)}
              placeholder="Summoner"
              required
              className="rounded-lg border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-white outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/70"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-300">Tag Line</span>
            <input
              value={tagLine}
              onChange={(event) => setTagLine(event.target.value)}
              placeholder="1234"
              required
              className="rounded-lg border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-white outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/70"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-300">Region</span>
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              className="rounded-lg border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-white outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/70"
            >
              <option value="americas">Americas</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="sea">SEA</option>
            </select>
          </label>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Tip: make sure the tag line matches the one displayed in the League client.
          </p>
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              'inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2 font-semibold text-slate-900 transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-slate-900',
              loading && 'cursor-not-allowed opacity-60'
            )}
          >
            {loading ? 'Searching…' : 'Track Player'}
          </button>
        </div>
        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
        ) : null}
      </form>
      {summary ? (
        <article className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/30 backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {summary.gameName}
                <span className="text-accent">#{summary.tagLine}</span>
              </h2>
              <p className="text-sm uppercase tracking-widest text-slate-300">{summary.region}</p>
            </div>
            <div className="rounded-full border border-slate-700/60 bg-slate-950/60 px-4 py-2 text-sm text-slate-300">
              {summary.matches.length} recent ranked matches
            </div>
          </div>
          {summary.matches.length > 0 ? (
            (() => {
              const aggregated = summary.matches.reduce(
                (acc, match) => ({
                  kills: acc.kills + match.kills,
                  deaths: acc.deaths + match.deaths,
                  assists: acc.assists + match.assists,
                  duration: acc.duration + match.duration
                }),
                { kills: 0, deaths: 0, assists: 0, duration: 0 }
              );
              const kdaRatio = (aggregated.kills + aggregated.assists) / Math.max(1, aggregated.deaths);
              const averageDuration = aggregated.duration / summary.matches.length;

              return (
                <div className="grid gap-4 rounded-xl border border-slate-800/70 bg-slate-950/50 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Average KDA</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{kdaRatio.toFixed(2)}</p>
                    <p className="text-sm text-slate-400">{aggregated.kills} / {aggregated.deaths} / {aggregated.assists} total</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Average Duration</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{formatDuration(Math.round(averageDuration))}</p>
                    <p className="text-sm text-slate-400">Across {summary.matches.length} matches</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Most recent match</p>
                    <p className="mt-1 text-base font-medium text-white">{formatDateTime(summary.matches[0].playedAt)}</p>
                    <p className="text-sm text-slate-400">ID: {summary.matches[0].matchId}</p>
                  </div>
                </div>
              );
            })()
          ) : (
            <p className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
              No recent ranked matches found.
            </p>
          )}
          {summary.matches.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {summary.matches.map((match) => (
                <div
                  key={match.matchId}
                  className="flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 transition hover:border-accent/60 hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <div className="flex items-start justify-between gap-3 text-sm text-slate-300">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Match</p>
                      <p className="font-semibold text-white">{match.matchId}</p>
                    </div>
                    <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">
                      {getQueueLabel(match.queueId)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span className="font-medium">
                      K/D/A{' '}
                      <span className="text-white">
                        {match.kills}/{match.deaths}/{match.assists}
                      </span>
                    </span>
                    <span>Champion #{match.championId}</span>
                    <span>{formatDuration(match.duration)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{formatDateTime(match.playedAt)}</span>
                    <span>Queue ID: {match.queueId}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
