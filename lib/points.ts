// lib/points.ts — zarządzanie pulą punktów odbioru (admin, część MVP-6).
// Czyste funkcje na Store. Punkt z klientami tylko wyłączamy (isActive=false),
// twarde usunięcie wyłącznie dla punktów bez przypisanych klientów — historia zostaje spójna.

import { PICKUP_DAY } from './config';
import type { PickupPoint, Store, User } from './types';

let _seq = 0;
function genId(prefix: string): string {
  _seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${_seq.toString(36)}`;
}

export interface NewPickupPoint {
  name: string;
  extraCost: number;
  hoursFrom: string;
  hoursTo: string;
  address?: string;
}

/** Klienci mający dany punkt jako domyślny. */
export function clientsAtPoint(store: Store, pointId: string): User[] {
  return store.users.filter(
    (u) => (u.role === 'klient_rws' || u.role === 'klient_zewnetrzny') && u.defaultPickupPointId === pointId,
  );
}

/** Dodaje nowy, aktywny punkt odbioru. Waliduje nazwę (niepusta, unikalna). */
export function addPickupPoint(store: Store, input: NewPickupPoint): PickupPoint {
  const name = input.name.trim();
  if (!name) throw new Error('Nazwa punktu nie może być pusta.');
  if (store.pickupPoints.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
    throw new Error(`Punkt o nazwie "${name}" już istnieje.`);
  }
  if (!Number.isFinite(input.extraCost) || input.extraCost < 0) {
    throw new Error('Koszt punktu musi być liczbą nieujemną.');
  }
  const point: PickupPoint = {
    id: genId('pp'),
    name,
    address: input.address?.trim() || name,
    gpsLat: null,
    gpsLon: null,
    pickupDay: PICKUP_DAY,
    hoursFrom: input.hoursFrom,
    hoursTo: input.hoursTo,
    extraCost: input.extraCost,
    isActive: true,
  };
  store.pickupPoints.push(point);
  return point;
}

/** Włącza/wyłącza punkt (soft) — wyłączony znika z wyboru w paczce i profilu. */
export function setPickupPointActive(store: Store, pointId: string, active: boolean): void {
  const point = store.pickupPoints.find((p) => p.id === pointId);
  if (!point) throw new Error(`Brak punktu o id ${pointId}.`);
  point.isActive = active;
}

/** Czy punkt występuje w danych historycznych (odbiory jakiegokolwiek tygodnia). */
export function pointHasHistory(store: Store, pointId: string): boolean {
  return store.clientPackages.some((c) => c.pickupPointId === pointId);
}

/**
 * Twarde usunięcie — tylko punkt bez przypisanych klientów I bez historii odbiorów
 * (archiwum tygodni odwołuje się do punktu; usunięcie osierociłoby te dane — wyłącz zamiast usuwać).
 */
export function removePickupPoint(store: Store, pointId: string): void {
  const point = store.pickupPoints.find((p) => p.id === pointId);
  if (!point) throw new Error(`Brak punktu o id ${pointId}.`);
  const clients = clientsAtPoint(store, pointId);
  if (clients.length > 0) {
    throw new Error(
      `Punkt "${point.name}" ma ${clients.length} przypisanych klientów — wyłącz go zamiast usuwać.`,
    );
  }
  if (pointHasHistory(store, pointId)) {
    throw new Error(
      `Punkt "${point.name}" występuje w historii odbiorów (archiwum tygodni) — wyłącz go zamiast usuwać.`,
    );
  }
  store.pickupPoints = store.pickupPoints.filter((p) => p.id !== pointId);
}
