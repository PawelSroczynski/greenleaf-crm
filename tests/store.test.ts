import { describe, it, expect, beforeEach } from 'vitest';
import { loadStore, saveStore, resetStore, STORE_KEY } from '@/lib/store';

describe('store + localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadStore bez danych inicjalizuje seed i zapisuje go', () => {
    expect(localStorage.getItem(STORE_KEY)).toBeNull();
    const store = loadStore();
    expect(store.products.length).toBeGreaterThanOrEqual(45);
    expect(localStorage.getItem(STORE_KEY)).not.toBeNull();
  });

  it('saveStore → loadStore zwraca te same dane', () => {
    const store = loadStore();
    store.products[0].name = 'ZMIENIONO_TEST';
    saveStore(store);
    const reloaded = loadStore();
    expect(reloaded.products[0].name).toBe('ZMIENIONO_TEST');
    expect(reloaded.products.length).toBe(store.products.length);
  });

  it('saveStore jest idempotentny (dwukrotny zapis = ten sam wynik)', () => {
    const store = loadStore();
    saveStore(store);
    const a = localStorage.getItem(STORE_KEY);
    saveStore(store);
    const b = localStorage.getItem(STORE_KEY);
    expect(a).toBe(b);
  });

  it('resetStore czyści i daje świeży seed', () => {
    const store = loadStore();
    store.products[0].name = 'BRUDNE_DANE';
    saveStore(store);
    const fresh = resetStore();
    expect(fresh.products[0].name).not.toBe('BRUDNE_DANE');
    expect(fresh.products.length).toBeGreaterThanOrEqual(45);
  });
});
