// lib/pickups.ts — logika domenowa domknięcia cyklu tygodnia:
// MVP-5 (zgłoszenie braku odbioru), MVP-7 (status/licznik), MVP-13 (potwierdzenie odbioru).
// Czyste funkcje na obiekcie Store (mutacja in-place). UI tylko je wywołuje + persystuje (saveStore).

import { ABSENCE_DEADLINE } from './config';
import type { ClientPackage, Store, User, WeeklyPackage } from './types';

/** WeeklyPackage dla danego ClientPackage. Rzuca, gdy brak. */
function resolvePackage(store: Store, clientPackageId: string): { cp: ClientPackage; wp: WeeklyPackage } {
  const cp = store.clientPackages.find((c) => c.id === clientPackageId);
  if (!cp) throw new Error(`Brak ClientPackage o id ${clientPackageId}.`);
  const wp = store.weeklyPackages.find((w) => w.id === cp.weeklyPackageId);
  if (!wp) throw new Error(`Brak WeeklyPackage o id ${cp.weeklyPackageId}.`);
  return { cp, wp };
}

/** Termin zgłoszenia braku odbioru = środa 10:00 (ABSENCE_DEADLINE) tygodnia paczki. */
export function getAbsenceDeadline(pkg: Pick<WeeklyPackage, 'pickupDate'>): Date {
  const pickup = new Date(`${pkg.pickupDate}T00:00:00.000Z`);
  const back = (pickup.getUTCDay() - ABSENCE_DEADLINE.dayOfWeek + 7) % 7;
  const deadline = new Date(pickup);
  deadline.setUTCDate(deadline.getUTCDate() - back);
  deadline.setUTCHours(ABSENCE_DEADLINE.hour, ABSENCE_DEADLINE.minute, 0, 0);
  return deadline;
}

/** Czy zgłoszenie braku jest jeszcze możliwe: now ściśle przed terminem. */
export function isAbsenceOpen(pkg: Pick<WeeklyPackage, 'pickupDate'>, now: Date): boolean {
  return now.getTime() < getAbsenceDeadline(pkg).getTime();
}

/** Zgłasza brak odbioru. Waliduje termin (śr 10:00). Mutuje i zwraca store. */
export function reportAbsence(store: Store, clientPackageId: string, now: Date): Store {
  const { cp, wp } = resolvePackage(store, clientPackageId);
  if (!isAbsenceOpen(wp, now)) {
    throw new Error('Zgłoszenie braku odbioru po terminie — okno jest zamknięte.');
  }
  cp.absenceReported = true;
  cp.absenceReportedAt = now.toISOString();
  cp.updatedAt = now.toISOString();
  return store;
}

/** Cofa zgłoszenie braku (klient zmienił zdanie). Waliduje termin. Mutuje i zwraca store. */
export function cancelAbsence(store: Store, clientPackageId: string, now: Date): Store {
  const { cp, wp } = resolvePackage(store, clientPackageId);
  if (!isAbsenceOpen(wp, now)) {
    throw new Error('Po terminie nie można cofnąć zgłoszenia braku odbioru.');
  }
  cp.absenceReported = false;
  cp.absenceReportedAt = null;
  cp.updatedAt = now.toISOString();
  return store;
}

/**
 * Potwierdzenie odbioru przez farmę (MVP-13). Ustawia status 'picked_up' + flagi.
 * Zmniejsza Subscription.packagesRemaining o 1 (nie poniżej 0).
 * Idempotentne: ponowne wywołanie na już odebranej paczce NIE odejmuje ponownie.
 */
export function markPickedUp(store: Store, clientPackageId: string, by: string): Store {
  const { cp } = resolvePackage(store, clientPackageId);
  if (cp.status === 'picked_up') return store; // idempotencja

  const now = new Date().toISOString();
  cp.status = 'picked_up';
  cp.pickupConfirmedFarm = true;
  cp.pickupConfirmedFarmAt = now;
  cp.pickupConfirmedFarmBy = by;
  cp.updatedAt = now;

  const sub = store.subscriptions.find((s) => s.id === cp.subscriptionId);
  if (sub) {
    sub.packagesRemaining = Math.max(0, sub.packagesRemaining - 1);
    sub.updatedAt = now;
  }
  return store;
}

export interface PickupRow {
  clientPackage: ClientPackage;
  user: User | undefined;
  pickupPointId: string | null;
}

/** Lista odbiorów dla opublikowanej paczki, opcjonalnie filtrowana po punkcie. */
export function pickupStatusList(
  store: Store,
  weeklyPackageId: string,
  pickupPointId?: string,
): PickupRow[] {
  return store.clientPackages
    .filter((c) => c.weeklyPackageId === weeklyPackageId)
    .map((cp) => {
      const user = store.users.find((u) => u.id === cp.userId);
      const point = cp.pickupPointId ?? user?.defaultPickupPointId ?? null;
      return { clientPackage: cp, user, pickupPointId: point };
    })
    .filter((row) => (pickupPointId ? row.pickupPointId === pickupPointId : true));
}

/** Klienci, którzy NIE odebrali I NIE zgłosili braku — flaga „nie zgłosił" dla admina. */
export function notPickedNotReported(store: Store, weeklyPackageId: string): ClientPackage[] {
  return store.clientPackages.filter(
    (c) => c.weeklyPackageId === weeklyPackageId && c.status !== 'picked_up' && !c.absenceReported,
  );
}

/** Bieżący klient RWS = pierwszy aktywny z ClientPackage opublikowanej paczki (Anna). */
export function findCurrentClient(store: Store) {
  const wp = store.weeklyPackages.find((w) => w.status === 'published');
  if (!wp) return null;
  const rwsIds = new Set(
    store.users.filter((u) => u.role === 'klient_rws' && u.isActive).map((u) => u.id),
  );
  const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id && rwsIds.has(c.userId));
  if (!cp) return null;
  const user = store.users.find((u) => u.id === cp.userId);
  const subscription = store.subscriptions.find((s) => s.id === cp.subscriptionId);
  return { wp, cp, user, subscription };
}
