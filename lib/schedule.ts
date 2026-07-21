// lib/schedule.ts — harmonogram odbiorów paczek (kalendarz dla klienta, uwaga Magdy F4).
// Daty sobotnie od startu sezonu; co tydzień lub co 2 tygodnie wg subskrypcji.

import { SEASON_START_SATURDAY } from './config';
import type { Subscription } from './types';

/** Lista dat odbioru (ISO 'YYYY-MM-DD') dla subskrypcji przez cały sezon. */
export function pickupDates(sub: Pick<Subscription, 'frequency' | 'totalPackages'>): string[] {
  const step = sub.frequency === 'biweekly' ? 14 : 7;
  const start = new Date(`${SEASON_START_SATURDAY}T00:00:00.000Z`);
  const dates: string[] = [];
  for (let i = 0; i < sub.totalPackages; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i * step);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export interface ScheduleEntry {
  date: string;
  index: number;
  delivered: boolean;
  isNext: boolean;
}

/**
 * Harmonogram z oznaczeniem odebranych (delivered) i najbliższej paczki (isNext).
 * Liczba odebranych = totalPackages − packagesRemaining.
 */
export function scheduleFor(
  sub: Pick<Subscription, 'frequency' | 'totalPackages' | 'packagesRemaining'>,
): ScheduleEntry[] {
  const dates = pickupDates(sub);
  const delivered = sub.totalPackages - sub.packagesRemaining;
  return dates.map((date, index) => ({
    date,
    index,
    delivered: index < delivered,
    isNext: index === delivered,
  }));
}
