import { db } from '@/lib/db';
import { fetchDDragonChampion } from '@/lib/ddragon';
import { cache } from 'react';

const RIOT_API_BASE = 'https://%REGION%.api.riotgames.com';

const regionRouting: Record<string, string> = {
  americas: 'americas',
  europe: 'europe',
  asia: 'asia',
  sea: 'sea'
};

const platformRouting: Record<string, string> = {
  americas: 'na1',
  europe: 'euw1',
  asia: 'kr',
  sea: 'sg2'
};

type ResolvePlayerArgs = {
  gameName: string;
  tagLine: string;
  region: string;
};

const fetchJson = cache(async (url: string, init?: RequestInit) => {
  const response = await fetch(url, {
    ...init,
    headers: {
      'X-Riot-Token': process.env.RIOT_API_KEY ?? '',
      ...(init?.headers ?? {})
    },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`Riot API request failed: ${response.status}`);
  }

  return response.json();
});

export async function resolvePlayer({ gameName, tagLine, region }: ResolvePlayerArgs) {
  const platform = platformRouting[region];

  if (!platform) {
    throw new Error(`Unsupported region: ${region}`);
  }

  const url = `${RIOT_API_BASE.replace('%REGION%', platform)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const account = await fetchJson(url);

  const existing = await db.player.upsert({
    where: { puuid: account.puuid },
    update: {
      gameName: account.gameName,
      tagLine: account.tagLine,
      region
    },
    create: {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      region
    }
  });

  return existing;
}

type PlayerMatchesArgs = {
  puuid: string;
  region: string;
  count?: number;
};

export async function getPlayerMatches({ puuid, region, count = 10 }: PlayerMatchesArgs) {
  const routing = regionRouting[region];

  if (!routing) {
    throw new Error(`Unsupported region: ${region}`);
  }

  const matchIds = (await fetchJson(
    `${RIOT_API_BASE.replace('%REGION%', routing)}/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?type=ranked&count=${count}`
  )) as string[];

  const matches = await Promise.all(
    matchIds.map(async (matchId) => {
      const match = await fetchJson(`${RIOT_API_BASE.replace('%REGION%', routing)}/lol/match/v5/matches/${matchId}`);
      const participant = match.info.participants.find((p: any) => p.puuid === puuid);

      if (!participant) {
        throw new Error('Participant not found in match');
      }

      await db.match.upsert({
        where: { matchId },
        update: {
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          championId: participant.championId,
          queueId: match.info.queueId,
          duration: match.info.gameDuration,
          playedAt: new Date(match.info.gameStartTimestamp)
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
          playedAt: new Date(match.info.gameStartTimestamp)
        }
      });

      return {
        matchId,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        championId: participant.championId,
        queueId: match.info.queueId,
        duration: match.info.gameDuration,
        playedAt: new Date(match.info.gameStartTimestamp).toISOString()
      };
    })
  );

  return matches;
}

type PlayerSummaryArgs = {
  puuid: string;
  region: string;
};

export async function getPlayerSummary({ puuid, region }: PlayerSummaryArgs) {
  const player = await db.player.findUnique({
    where: { puuid },
    include: {
      matches: {
        orderBy: { playedAt: 'desc' },
        take: 10
      }
    }
  });

  if (!player) {
    throw new Error('Player not found');
  }

  if (player.matches.length === 0) {
    const matches = await getPlayerMatches({ puuid, region });
    player.matches = matches.map((match) => ({
      id: match.matchId,
      matchId: match.matchId,
      playerId: player.id,
      kills: match.kills,
      deaths: match.deaths,
      assists: match.assists,
      championId: match.championId,
      queueId: match.queueId,
      duration: match.duration,
      playedAt: new Date(match.playedAt),
      createdAt: new Date()
    }));
  }

  const championDetails = await Promise.all(
    player.matches.map(async (match) => {
      const champion = await fetchDDragonChampion(match.championId);
      return {
        ...match,
        champion
      };
    })
  );

  return {
    puuid: player.puuid,
    gameName: player.gameName,
    tagLine: player.tagLine,
    region: player.region,
    matches: championDetails.map((match) => ({
      matchId: match.matchId,
      kills: match.kills,
      deaths: match.deaths,
      assists: match.assists,
      championId: match.championId,
      queueId: match.queueId,
      duration: match.duration,
      playedAt: match.playedAt.toISOString(),
      champion: match.champion
    }))
  };
}
