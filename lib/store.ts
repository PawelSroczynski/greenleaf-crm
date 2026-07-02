// lib/store.ts — store w pamięci + persystencja localStorage (frontend-only, mock backend).
// SINGLETON: loadStore zwraca jedną wspólną instancję dla wszystkich komponentów.
// Bez tego komponenty montowane równolegle (np. PackageStatus + SwapPanel) trzymałyby
// osobne kopie i późniejszy saveStore przestarzałej kopii cofałby wcześniejsze zmiany.

import { createSeedData } from './seed';
import type { Store } from './types';

export const STORE_KEY = 'glcrm_store';

let cache: Store | null = null;

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** Zapis do localStorage (JSON). Idempotentny — ten sam store daje ten sam string. */
export function saveStore(store: Store): void {
  cache = store;
  if (!hasStorage()) return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

/**
 * Zwraca wspólną instancję store (singleton). Jeśli localStorage jest puste
 * (świeży start / wyczyszczone / reset) → generuje seed i unieważnia cache,
 * dzięki czemu testy i reset przeglądarki zawsze dostają świeże dane.
 */
export function loadStore(): Store {
  if (!hasStorage()) {
    return cache ?? createSeedData();
  }
  const raw = window.localStorage.getItem(STORE_KEY);
  if (!raw) {
    const seed = createSeedData();
    saveStore(seed);
    return seed;
  }
  if (!cache) {
    cache = JSON.parse(raw) as Store;
  }
  return cache;
}

/** Czyści localStorage i ładuje świeży seed. */
export function resetStore(): Store {
  cache = null;
  if (hasStorage()) {
    window.localStorage.removeItem(STORE_KEY);
  }
  const seed = createSeedData();
  saveStore(seed);
  return seed;
}
