// lib/store.ts — store w pamięci + persystencja localStorage (frontend-only, mock backend).

import { createSeedData } from './seed';
import type { Store } from './types';

export const STORE_KEY = 'glcrm_store';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** Zapis do localStorage (JSON). Idempotentny — ten sam store daje ten sam string. */
export function saveStore(store: Store): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

/**
 * Czyta store z localStorage. Jeśli brak danych (lub brak window/SSR) →
 * generuje świeży seed i — gdy storage dostępne — zapisuje go.
 */
export function loadStore(): Store {
  if (!hasStorage()) {
    return createSeedData();
  }
  const raw = window.localStorage.getItem(STORE_KEY);
  if (!raw) {
    const seed = createSeedData();
    saveStore(seed);
    return seed;
  }
  return JSON.parse(raw) as Store;
}

/** Czyści localStorage i ładuje świeży seed. */
export function resetStore(): Store {
  if (hasStorage()) {
    window.localStorage.removeItem(STORE_KEY);
  }
  const seed = createSeedData();
  saveStore(seed);
  return seed;
}
