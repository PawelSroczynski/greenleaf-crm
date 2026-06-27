// lib/swaps.ts — logika domenowa modułu "Zamiany produktów" (MVP-4).
// Czyste funkcje operujące na obiekcie Store (mutacja in-place). UI tylko je wywołuje
// i decyduje o persystencji (saveStore). Brak side-effectów poza przekazanym store.

import { SWAP_DEADLINE } from './config';
import { isProductAvailable } from './seed';
import { getPackageMonth, itemsForPackage } from './packages';
import type { Product, Store, Swap, WeeklyPackage } from './types';

// Lokalny generator ID (unikalny w obrębie procesu, bez zależności od crypto).
let _seq = 0;
function genId(prefix: string): string {
  _seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${_seq.toString(36)}`;
}

/**
 * Termin zamian = środa 20:00 (SWAP_DEADLINE z config) tygodnia paczki.
 * Wyprowadzony z pickupDate (sobota) — cofamy się do dnia tygodnia z config.
 */
export function getSwapDeadline(pkg: Pick<WeeklyPackage, 'pickupDate'>): Date {
  const pickup = new Date(`${pkg.pickupDate}T00:00:00.000Z`);
  const back = (pickup.getUTCDay() - SWAP_DEADLINE.dayOfWeek + 7) % 7;
  const deadline = new Date(pickup);
  deadline.setUTCDate(deadline.getUTCDate() - back);
  deadline.setUTCHours(SWAP_DEADLINE.hour, SWAP_DEADLINE.minute, 0, 0);
  return deadline;
}

/** Czy zamiany są otwarte: now ściśle przed terminem. */
export function isSwapOpen(pkg: Pick<WeeklyPackage, 'pickupDate'>, now: Date): boolean {
  return now.getTime() < getSwapDeadline(pkg).getTime();
}

/** Pomocniczo: ClientPackage + jego WeeklyPackage. Rzuca, gdy brak. */
function resolvePackage(store: Store, clientPackageId: string): WeeklyPackage {
  const cp = store.clientPackages.find((c) => c.id === clientPackageId);
  if (!cp) throw new Error(`Brak ClientPackage o id ${clientPackageId}.`);
  const wp = store.weeklyPackages.find((w) => w.id === cp.weeklyPackageId);
  if (!wp) throw new Error(`Brak WeeklyPackage o id ${cp.weeklyPackageId}.`);
  return wp;
}

/**
 * Dozwolone zamienniki = produkty SEZONOWE i aktywne w miesiącu paczki (getPackageMonth),
 * z wyłączeniem produktów już obecnych w paczce (G1: „dowolne z listy sezonowej").
 */
export function replacementOptions(store: Store, clientPackageId: string): Product[] {
  const wp = resolvePackage(store, clientPackageId);
  const month = getPackageMonth(wp);
  const inPackage = new Set(itemsForPackage(store, wp.id).map((i) => i.productId));
  return store.products.filter(
    (p) => p.isActive && isProductAvailable(p, month) && !inPackage.has(p.id),
  );
}

/**
 * Zapisuje zamianę originalProductId → replacementProductId dla ClientPackage.
 * Walidacja: (a) now < termin (inaczej „po terminie"); (b) replacement w replacementOptions.
 * Idempotencja: kolejna zamiana tego samego oryginału AKTUALIZUJE istniejący Swap (upsert).
 * Mutuje i zwraca store.
 */
export function applySwap(
  store: Store,
  clientPackageId: string,
  originalProductId: string,
  replacementProductId: string,
  now: Date,
): Store {
  const wp = resolvePackage(store, clientPackageId);

  if (!isSwapOpen(wp, now)) {
    throw new Error('Zamiany po terminie — okno zamian jest zamknięte.');
  }

  const allowed = replacementOptions(store, clientPackageId);
  if (!allowed.some((p) => p.id === replacementProductId)) {
    throw new Error(`Produkt ${replacementProductId} nie jest dozwolonym zamiennikiem.`);
  }

  const existing = store.swaps.find(
    (s) => s.clientPackageId === clientPackageId && s.originalProductId === originalProductId,
  );
  if (existing) {
    existing.replacementProductId = replacementProductId;
    existing.createdAt = now.toISOString();
  } else {
    const swap: Swap = {
      id: genId('swap'),
      clientPackageId,
      originalProductId,
      replacementProductId,
      createdAt: now.toISOString(),
    };
    store.swaps.push(swap);
  }

  return store;
}

/** Zamiany przypięte do danego ClientPackage. */
export function swapsForClientPackage(store: Store, clientPackageId: string): Swap[] {
  return store.swaps.filter((s) => s.clientPackageId === clientPackageId);
}

export interface SwapSummaryRow {
  productId: string;
  name: string;
  out: number; // ile sztuk wychodzi (zamienione)
  in: number; // ile sztuk wchodzi (zamienniki)
}

/**
 * Agregacja dla admina: per produkt ile sztuk wychodzi (original) i ile wchodzi (replacement)
 * po wszystkich zamianach w ramach danej WeeklyPackage — „ile czego przygotować po zamianach".
 */
export function swapSummary(store: Store, weeklyPackageId: string): SwapSummaryRow[] {
  const cpIds = new Set(
    store.clientPackages.filter((c) => c.weeklyPackageId === weeklyPackageId).map((c) => c.id),
  );
  const rows = new Map<string, SwapSummaryRow>();
  const productName = (id: string) => store.products.find((p) => p.id === id)?.name ?? id;
  const row = (id: string): SwapSummaryRow => {
    let r = rows.get(id);
    if (!r) {
      r = { productId: id, name: productName(id), out: 0, in: 0 };
      rows.set(id, r);
    }
    return r;
  };

  for (const swap of store.swaps) {
    if (!cpIds.has(swap.clientPackageId)) continue;
    row(swap.originalProductId).out += 1;
    row(swap.replacementProductId).in += 1;
  }

  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name));
}
