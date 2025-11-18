import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export type Region = 'americas' | 'europe' | 'asia' | 'sea';

export interface ResolvePlayerRequest {
  gameName: string;
  tagLine: string;
  region: Region;
}

export interface ResolvePlayerResponse {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: Region;
}

export interface ChampionDetails {
  id: number;
  name: string;
  image: string | null;
}

export interface MatchSummary {
  matchId: string;
  kills: number;
  deaths: number;
  assists: number;
  championId: number;
  queueId: number;
  duration: number;
  playedAt: string;
  champion?: ChampionDetails | null;
}

export interface PlayerSummaryResponse {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: Region;
  matches: MatchSummary[];
}

export interface PlayerMatchesResponse {
  matches: MatchSummary[];
}

@Injectable({ providedIn: 'root' })
export class PlayerTrackerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  resolvePlayer(body: ResolvePlayerRequest): Observable<ResolvePlayerResponse> {
    return this.http.post<ResolvePlayerResponse>(`${this.baseUrl}/players/resolve`, body);
  }

  fetchSummary(puuid: string, region: Region): Observable<PlayerSummaryResponse> {
    const params = new HttpParams().set('region', region);
    return this.http.get<PlayerSummaryResponse>(`${this.baseUrl}/players/${encodeURIComponent(puuid)}/summary`, {
      params
    });
  }

  fetchMatches(puuid: string, region: Region, count?: number): Observable<PlayerMatchesResponse> {
    let params = new HttpParams().set('region', region);
    if (count) {
      params = params.set('count', String(count));
    }
    return this.http.get<PlayerMatchesResponse>(`${this.baseUrl}/players/${encodeURIComponent(puuid)}/matches`, {
      params
    });
  }
}
