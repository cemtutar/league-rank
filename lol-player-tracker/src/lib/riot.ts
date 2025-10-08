// src/lib/riot.ts
import { db as _db } from '@/lib/db';
import { fetchDDragonChampion } from '@/lib/ddragon';
import { cache } from 'react';

const RIOT_API_BASE = 'https://%HOST%.api.riotgames.com';

/**
 * Regional routing (for Account-v1 & Match-v5)
 * Use these hosts for:
 *  - /riot/account/v1/...
 *  - /lol/match/v5/...
 */
const regionalHost: Record<string, string> = {
  americas: 'americas',
  europe: 'europe',
  asia: 'asia',
  sea: 'sea',
};

/**
 * Platform routing (for Summoner-v4 / League-v4 if/when you add them)
 * Your current code doesn't call those yet, but we keep this ready.
 */
const platformHost: Record<string, string> = {
  americas: 'na1',  // NA
  europe: 'euw1',   // EUW example
  asia: 'kr',       // Korea example
  sea: 'sg2',       // SEA example
};

type ResolvePlayerArgs = {
  gameName: string;
  tagLine: string;
  region: keyof typeof regionalHost; // 'americas' | 'europe' | 'asia' | 'sea'
};

type PlayerMatchesArgs = {
  puuid: string;
  region: keyof typeof regionalHost;
  count?: number;
};

type PlayerSummaryArgs = {
  puuid: string;
  region: keyof typeof regionalHost;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const fetchJson = cache(async (url: string, init?: RequestInit) => {
  const res = await fetch(url, {
    ...init,
    headers: {
      'X-Riot-Token': process.env.RIOT_API_KEY ?? '',
      'Accept': 'application/json',
      'User-Agent': 'PoroMetrics/0.1 (+https://porometrics.example)',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
    next: { revalidate: 60 }, // you can tune this
  });

  // Read body text once for better errors
  const text = await res.text();

  // Rate limit: 429 → wait Retry-After then retry once (light touch)
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('retry-after') || 2);
    console.warn(`[Riot] 429 rate limited. Waiting ${retryAfter}s. url=${url}`);
    await sleep(retryAfter * 1000);
    const retry = await fetch(url, {
      ...init,
      headers: {
        'X-Riot-Token': process.env.RIOT_API_KEY ?? '',
        'Accept': 'application/json',
        'User-Agent': 'PoroMetrics/0.1 (+https://porometrics.example)',
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });
    const retryText = await retry.text();
    if (!retry.ok) {
      throw new Error(
        `Riot API 429 (after retry) ${retry.status} ${retry.statusText}\nbody=${retryText || '<empty>'}`
      );
    }
    return retryText ? JSON.parse(retryText) : {};
  }

  // Transient 5xx: brief backoff and one retry
  if (res.status >= 500 && res.status < 600) {
    console.warn(`[Riot] ${res.status} server error. Retrying shortly. url=${url}`);
    await sleep(500);
    const retry = await fetch(url, {
      ...init,
      headers: {
        'X-Riot-Token': process.env.RIOT_API_KEY ?? '',
        'Accept': 'application/json',
        'User-Agent': 'PoroMetrics/0.1 (+https://porometrics.example)',
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });
    const retryText = await retry.text();
    if (!retry.ok) {
      throw new Error(
        `Riot API ${retry.status} ${retry.statusText} (after retry)\nbody=${retryText || '<empty>'}`
      );
    }
    return retryText ? JSON.parse(retryText) : {};
  }

  if (!res.ok) {
    const hint =
      res.status === 403
        ? 'Forbidden. Check RIOT_API_KEY (present, correct, not expired; dev keys rotate ~24h). Also verify host & path.'
        : '';
    throw new Error(
      `Riot API request failed: ${res.status} ${res.statusText}. ${hint}\nbody=${text || '<empty>'}`
    );
  }

  return text ? JSON.parse(text) : {};
});

/** Resolve Riot ID → PUUID (Account-v1 on REGIONAL host, NOT platform) */
export async function resolvePlayer({ gameName, tagLine, region }: ResolvePlayerArgs) {
  const reg = regionalHost[region];
  if (!reg) throw new Error(`Unsupported region: ${region}`);

  const url = `${RIOT_API_BASE.replace('%HOST%', reg)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    gameName
  )}/${encodeURIComponent(tagLine)}`;

  const account = await fetchJson(url);

  // Store/update minimal player row
  const existing = await _db.player.upsert({
    where: { puuid: account.puuid },
    update: {
      gameName: account.gameName,
      tagLine: account.tagLine,
      region,
    },
    create: {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      region,
    },
  });

  return existing;
}

/** PUUID → recent match summaries (Match-v5 on REGIONAL host) */
export async function getPlayerMatches({ puuid, region, count = 10 }: PlayerMatchesArgs) {
  const reg = regionalHost[region];
  if (!reg) throw new Error(`Unsupported region: ${region}`);

  const idsUrl = `${RIOT_API_BASE.replace('%HOST%', reg)}/lol/match/v5/matches/by-puuid/${encodeURIComponent(
    puuid
  )}/ids?type=ranked&count=${count}`;

  const matchIds = (await fetchJson(idsUrl)) as string[];

  const matches = await Promise.all(
    matchIds.map(async (matchId) => {
      const matchUrl = `${RIOT_API_BASE.replace('%HOST%', reg)}/lol/match/v5/matches/${matchId}`;
      const match = await fetchJson(matchUrl);

      const participant = match?.info?.participants?.find((p: any) => p.puuid === puuid);
      if (!participant) throw new Error(`Participant not found in match ${matchId}`);

      await _db.match.upsert({
        where: { matchId },
        update: {
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          championId: participant.championId,
          queueId: match.info.queueId,
          duration: match.info.gameDuration,
          playedAt: new Date(match.info.gameStartTimestamp),
        },
        create: {
          matchId,
          player: { connect: { puuid } },
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          championId: participant.championId,
          queueId: match.info.queueId,
          duration: match.info.gameDuration,
          playedAt: new Date(match.info.gameStartTimestamp),
        },
      });

      return {
        matchId,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        championId: participant.championId,
        queueId: match.info.queueId,
        duration: match.info.gameDuration,
        playedAt: new Date(match.info.gameStartTimestamp).toISOString(),
      };
    })
  );

  return matches;
}

/** Summary with champion details (uses your DDragon helper) */
export async function getPlayerSummary({ puuid, region }: PlayerSummaryArgs) {
  const player = await _db.player.findUnique({
    where: { puuid },
    include: {
      matches: {
        orderBy: { playedAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!player) throw new Error('Player not found');

  // Backfill if no matches yet
  if (player.matches.length === 0) {
    const fetched = await getPlayerMatches({ puuid, region });
    // shape to local Match model (if you need immediate return without re-query)
    player.matches = fetched.map((m) => ({
      id: m.matchId, // placeholder if your model uses matchId as id; adjust if needed
      matchId: m.matchId,
      playerId: (player as any).id ?? '', // adjust if your schema differs
      kills: m.kills,
      deaths: m.deaths,
      assists: m.assists,
      championId: m.championId,
      queueId: m.queueId,
      duration: m.duration,
      playedAt: new Date(m.playedAt),
      createdAt: new Date(),
    })) as any;
  }

  const withChamp = await Promise.all(
    player.matches.map(async (m) => {
      const champion = await fetchDDragonChampion(m.championId);
      return { ...m, champion };
    })
  );

  return {
    puuid: player.puuid,
    gameName: player.gameName,
    tagLine: player.tagLine,
    region: player.region,
    matches: withChamp.map((m) => ({
      matchId: m.matchId,
      kills: m.kills,
      deaths: m.deaths,
      assists: m.assists,
      championId: m.championId,
      queueId: m.queueId,
      duration: m.duration,
      playedAt: m.playedAt.toISOString(),
      champion: m.champion,
    })),
  };
}
