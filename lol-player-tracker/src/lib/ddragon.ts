import { cache } from 'react';

const DDRAGON_CHAMPION_URL = 'https://ddragon.leagueoflegends.com/cdn/14.9.1/data/en_US/champion.json';

let cachedChampions: Record<string, any> | null = null;

export const fetchDDragonChampion = cache(async (championId: number) => {
  if (!cachedChampions) {
    const response = await fetch(DDRAGON_CHAMPION_URL, { next: { revalidate: 60 * 60 } });

    if (!response.ok) {
      throw new Error('Failed to load champion data');
    }

    const data = (await response.json()) as { data: Record<string, any> };
    cachedChampions = data.data;
  }

  const champion = Object.values(cachedChampions!).find((c: any) => Number(c.key) === championId);

  if (!champion) {
    return {
      id: championId,
      name: 'Unknown Champion',
      image: null
    };
  }

  return {
    id: championId,
    name: champion.name as string,
    image: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`
  };
});
