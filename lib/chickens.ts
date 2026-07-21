// lib/chickens.ts — rezerwacje kurczaków (F9): kiedy kolejna partia + zapisy klientów.

import { CHICKEN, CHICKEN_BATCHES } from './config';
import type { ChickenReservation, Store } from './types';

let _seq = 0;
function genId(): string {
  _seq += 1;
  return `chk_${Date.now().toString(36)}_${_seq.toString(36)}`;
}

export function chickenBatches() {
  return CHICKEN_BATCHES;
}

/** Klient zapisuje się na partię kurczaków. Waliduje liczbę tuszek > 0. */
export function reserveChicken(
  store: Store,
  userId: string,
  batch: ChickenReservation['batch'],
  carcassCount: number,
  wantsGiblets: boolean,
  now: string = new Date().toISOString(),
): ChickenReservation {
  if (!Number.isFinite(carcassCount) || carcassCount <= 0) {
    throw new Error('Liczba tuszek musi być większa od zera.');
  }
  const plannedDate = CHICKEN_BATCHES.find((b) => b.batch === batch)?.plannedDate ?? '';
  const owner = store.users.find((u) => u.id === userId);
  const res: ChickenReservation = {
    id: genId(),
    userId,
    batch,
    plannedDate,
    carcassCount,
    wantsGiblets,
    actualWeightKg: null,
    pricePerKg: CHICKEN.pricePerKg,
    avgCarcassWeight: CHICKEN.avgCarcassWeight,
    totalAmount: null,
    status: 'reserved',
    paymentStatus: 'unpaid',
    paymentMethod: null,
    pickupPointId: owner?.defaultPickupPointId ?? null,
    note: null,
    createdAt: now,
    updatedAt: now,
  };
  store.chickenReservations.push(res);
  return res;
}

export function reservationsForUser(store: Store, userId: string): ChickenReservation[] {
  return store.chickenReservations.filter((r) => r.userId === userId);
}

export function reservationsForBatch(store: Store, batch: string): ChickenReservation[] {
  return store.chickenReservations.filter((r) => r.batch === batch);
}

export function cancelReservation(store: Store, id: string): void {
  store.chickenReservations = store.chickenReservations.filter((r) => r.id !== id);
}
