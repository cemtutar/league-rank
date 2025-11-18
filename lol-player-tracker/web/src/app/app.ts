import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  MatchSummary,
  PlayerSummaryResponse,
  PlayerTrackerService,
  Region
} from './player-tracker.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly formBuilder = inject(FormBuilder);
  private readonly tracker = inject(PlayerTrackerService);

  readonly regions: Region[] = ['americas', 'europe', 'asia', 'sea'];
  readonly queueLabels: Record<number, string> = {
    420: 'Ranked Solo/Duo',
    430: 'Normal Draft',
    440: 'Ranked Flex',
    450: 'ARAM',
    400: 'Normal Blind'
  };

  readonly form = this.formBuilder.group({
    gameName: ['', Validators.required],
    tagLine: ['', Validators.required],
    region: ['americas' as Region, Validators.required]
  });

  readonly summary = signal<PlayerSummaryResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { gameName, tagLine, region } = this.form.getRawValue();
    if (!gameName || !tagLine || !region) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.summary.set(null);

    try {
      const player = await firstValueFrom(
        this.tracker.resolvePlayer({ gameName, tagLine, region })
      );

      const summary = await firstValueFrom(this.tracker.fetchSummary(player.puuid, region));
      this.summary.set(summary);
    } catch (error) {
      console.error('Player lookup failed', error);
      this.error.set(this.parseError(error));
    } finally {
      this.loading.set(false);
    }
  }

  getQueueLabel(queueId: number) {
    return this.queueLabels[queueId] ?? `Queue ${queueId}`;
  }

  formatDuration(seconds: number) {
    const safeSeconds = Math.max(0, Math.round(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remaining = safeSeconds % 60;
    return `${minutes}m ${remaining.toString().padStart(2, '0')}s`;
  }

  getAggregate(summary: PlayerSummaryResponse | null) {
    if (!summary || summary.matches.length === 0) {
      return null;
    }

    const totals = summary.matches.reduce(
      (acc, match) => {
        acc.kills += match.kills;
        acc.deaths += match.deaths;
        acc.assists += match.assists;
        acc.duration += match.duration;
        return acc;
      },
      { kills: 0, deaths: 0, assists: 0, duration: 0 }
    );

    const averageDuration = totals.duration / summary.matches.length;
    const kda = (totals.kills + totals.assists) / Math.max(1, totals.deaths);

    return {
      totalKills: totals.kills,
      totalDeaths: totals.deaths,
      totalAssists: totals.assists,
      averageDurationSeconds: Math.round(averageDuration),
      kda: kda.toFixed(2)
    };
  }

  trackMatch(index: number, match: MatchSummary) {
    return match.matchId;
  }

  private parseError(error: unknown) {
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      return error.message;
    }
    return 'Unable to load player data. Please verify the Riot ID and try again.';
  }
}
