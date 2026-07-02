// lib/deadlines.ts — wspólny helper terminów tygodniowych (zamiany śr 20:00, brak odbioru śr 10:00).
// Używany przez swaps.ts, pickups.ts i packages.ts (jedno źródło wyliczenia).

export interface WeeklyDeadlineSpec {
  dayOfWeek: number; // konwencja Date.getDay(): 0 = niedziela ... 3 = środa
  hour: number;
  minute: number;
}

/**
 * Termin tygodniowy wyprowadzony z daty odbioru ('YYYY-MM-DD', sobota):
 * cofamy się do wskazanego dnia tygodnia i ustawiamy godzinę (UTC).
 */
export function weeklyDeadline(pickupDate: string, spec: WeeklyDeadlineSpec): Date {
  const pickup = new Date(`${pickupDate}T00:00:00.000Z`);
  const back = (pickup.getUTCDay() - spec.dayOfWeek + 7) % 7;
  const deadline = new Date(pickup);
  deadline.setUTCDate(deadline.getUTCDate() - back);
  deadline.setUTCHours(spec.hour, spec.minute, 0, 0);
  return deadline;
}
