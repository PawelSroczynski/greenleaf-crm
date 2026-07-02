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

  // Regresja: dwa komponenty (np. PackageStatus + SwapPanel) montowane równolegle
  // NIE mogą trzymać osobnych kopii — późniejszy zapis przestarzałej kopii cofałby
  // wcześniejsze zmiany (np. zamiana kasowała zgłoszenie "Nie odbiorę").
  it('loadStore zwraca tę samą instancję (singleton) — brak utraty równoległych zapisów', () => {
    const a = loadStore(); // komponent 1
    const b = loadStore(); // komponent 2 (montowany równolegle)
    expect(b).toBe(a); // ta sama referencja

    // scenariusz z buga: komponent 1 zapisuje flagę, komponent 2 potem zapisuje swapy
    a.clientPackages[0].absenceReported = true;
    saveStore(a);
    b.swaps.push({
      id: 'swap_test',
      clientPackageId: b.clientPackages[0].id,
      originalProductId: b.products[0].id,
      replacementProductId: b.products[1].id,
      createdAt: new Date().toISOString(),
    });
    saveStore(b);

    const reloaded = loadStore();
    expect(reloaded.clientPackages[0].absenceReported).toBe(true); // NIE zgubione
    expect(reloaded.swaps).toHaveLength(1);
  });

  it('singleton unieważnia się po wyczyszczeniu localStorage (świeży seed)', () => {
    const a = loadStore();
    a.products[0].name = 'BRUDNE';
    saveStore(a);
    localStorage.clear(); // np. reset przeglądarki / testy
    const b = loadStore();
    expect(b.products[0].name).not.toBe('BRUDNE');
  });
});
