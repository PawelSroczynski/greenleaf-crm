import { describe, it, expect } from 'vitest';
import { createSeedData } from '@/lib/seed';
import {
  canAddProduct,
  createDraftPackage,
  addItemToPackage,
  removeItemFromPackage,
  itemsForPackage,
  activePackageSubscriptions,
  publishPackage,
  getPackageMonth,
} from '@/lib/packages';
import { saveStore, loadStore } from '@/lib/store';

function findProduct(store: ReturnType<typeof createSeedData>, name: string) {
  const p = store.products.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (!p) throw new Error(`Brak produktu w seed: ${name}`);
  return p;
}

describe('packages — walidacja sezonu (canAddProduct)', () => {
  const store = createSeedData();

  it('pomidor (maj, miesiąc 5) jest ODRZUCONY', () => {
    const tomato = findProduct(store, 'Pomidor');
    expect(canAddProduct(tomato.id, 5, store)).toBe(false);
  });

  it('ogórek gruntowy (czerwiec, miesiąc 6) jest DOZWOLONY', () => {
    const cucumber = findProduct(store, 'Ogórek gruntowy');
    expect(canAddProduct(cucumber.id, 6, store)).toBe(true);
  });

  it('sałata masłowa (czerwiec, miesiąc 6) jest DOZWOLONA', () => {
    const lettuce = findProduct(store, 'Sałata masłowa');
    expect(canAddProduct(lettuce.id, 6, store)).toBe(true);
  });

  it('nieistniejący produkt jest ODRZUCONY', () => {
    expect(canAddProduct('prod_nope', 6, store)).toBe(false);
  });
});

describe('packages — dodawanie / usuwanie pozycji z guardem', () => {
  it('addItemToPackage dla sezonowego produktu dodaje pozycję', () => {
    const store = createSeedData();
    const draft = createDraftPackage(store, 5, '2026-06-20');
    const cucumber = findProduct(store, 'Ogórek gruntowy');
    const month = getPackageMonth(draft);

    const item = addItemToPackage(store, draft.id, cucumber.id, 1, cucumber.unit, month);
    expect(item.productId).toBe(cucumber.id);
    expect(itemsForPackage(store, draft.id)).toHaveLength(1);
  });

  it('addItemToPackage dla produktu spoza sezonu RZUCA błędem (guard)', () => {
    const store = createSeedData();
    const draft = createDraftPackage(store, 5, '2026-06-20'); // czerwiec
    const tomato = findProduct(store, 'Pomidor'); // niedostępny w czerwcu
    const month = getPackageMonth(draft);

    expect(() => addItemToPackage(store, draft.id, tomato.id, 1, tomato.unit, month)).toThrow();
    expect(itemsForPackage(store, draft.id)).toHaveLength(0);
  });

  it('removeItemFromPackage usuwa pozycję', () => {
    const store = createSeedData();
    const draft = createDraftPackage(store, 5, '2026-06-20');
    const lettuce = findProduct(store, 'Sałata masłowa');
    const item = addItemToPackage(store, draft.id, lettuce.id, 1, lettuce.unit, 6);
    expect(itemsForPackage(store, draft.id)).toHaveLength(1);

    removeItemFromPackage(store, item.id);
    expect(itemsForPackage(store, draft.id)).toHaveLength(0);
  });
});

describe('packages — publikacja generuje ClientPackage', () => {
  it('w seed są 4 aktywne subskrypcje paczkowe (paczka_24 / paczka_12)', () => {
    const store = createSeedData();
    expect(activePackageSubscriptions(store)).toHaveLength(4);
  });

  it('publishPackage ustawia status=published i publishedAt', () => {
    const store = createSeedData();
    const draft = createDraftPackage(store, 5, '2026-06-20');
    addItemToPackage(store, draft.id, findProduct(store, 'Ogórek gruntowy').id, 1, 'kg', 6);
    const { package: pkg } = publishPackage(store, draft.id, '2026-06-16T10:00:00.000Z');
    expect(pkg.status).toBe('published');
    expect(pkg.publishedAt).toBe('2026-06-16T10:00:00.000Z');
  });

  it('publishPackage generuje 1 ClientPackage (status pending) na aktywną subskrypcję paczkową', () => {
    const store = createSeedData();
    const draft = createDraftPackage(store, 5, '2026-06-20');
    addItemToPackage(store, draft.id, findProduct(store, 'Ogórek gruntowy').id, 1, 'kg', 6);
    const before = store.clientPackages.length;

    const all = publishPackage(store, draft.id).clientPackages;
    const clientPackages = all.filter((cp) => cp.kind === 'package');

    expect(clientPackages).toHaveLength(4);
    expect(all.every((cp) => cp.status === 'pending')).toBe(true);
    expect(all.every((cp) => cp.weeklyPackageId === draft.id)).toBe(true);
    // każda aktywna subskrypcja paczkowa ma dokładnie jeden ClientPackage dla tej paczki
    const subIds = activePackageSubscriptions(store).map((s) => s.id).sort();
    const cpSubIds = clientPackages.map((cp) => cp.subscriptionId).sort();
    expect(cpSubIds).toEqual(subIds);
    // 4 paczki + 2 jajka (Tomasz, Ewa)
    expect(store.clientPackages.length).toBe(before + all.length);
    expect(all.filter((c) => c.kind === 'eggs')).toHaveLength(2);
  });

  it('zmiany są utrwalone w store (saveStore → loadStore)', () => {
    localStorage.clear();
    const store = loadStore();
    const draft = createDraftPackage(store, 9, '2026-06-27');
    addItemToPackage(store, draft.id, findProduct(store, 'Ogórek gruntowy').id, 1, 'kg', 6);
    publishPackage(store, draft.id, '2026-06-23T10:00:00.000Z');
    saveStore(store);

    const reloaded = loadStore();
    const reloadedPkg = reloaded.weeklyPackages.find((w) => w.id === draft.id);
    expect(reloadedPkg?.status).toBe('published');
    expect(reloaded.clientPackages.filter((cp) => cp.weeklyPackageId === draft.id && cp.kind === 'package')).toHaveLength(4);
  });
});

describe('packages — poprawki skanu (guardy)', () => {
  it('ponowna publikacja tej samej paczki jest odrzucona (brak duplikatów ClientPackage)', () => {
    const store = createSeedData();
    const draft = createDraftPackage(store, 5, '2026-06-20');
    const cucumber = findProduct(store, 'Ogórek gruntowy');
    addItemToPackage(store, draft.id, cucumber.id, 1, 'kg', 6);

    publishPackage(store, draft.id);
    const after = store.clientPackages.length;
    expect(() => publishPackage(store, draft.id)).toThrow();
    expect(store.clientPackages.length).toBe(after); // zero duplikatów
  });

  it('publikacja pustej paczki (bez pozycji) jest odrzucona', () => {
    const store = createSeedData();
    const draft = createDraftPackage(store, 5, '2026-06-20');
    expect(() => publishPackage(store, draft.id)).toThrow();
  });

  it('createDraftPackage wylicza deadliny (środa 20:00 / 10:00), nie zostawia pustych', () => {
    const store = createSeedData();
    const draft = createDraftPackage(store, 5, '2026-06-20'); // sobota
    expect(draft.swapDeadline).toBe('2026-06-17T20:00:00.000Z'); // środa 20:00
    expect(draft.absenceDeadline).toBe('2026-06-17T20:00:00.000Z'); // środa 20:00
  });

  it('addItemToPackage odrzuca ilość NaN, zero i ujemną', () => {
    const store = createSeedData();
    const draft = createDraftPackage(store, 5, '2026-06-20');
    const cucumber = findProduct(store, 'Ogórek gruntowy');
    expect(() => addItemToPackage(store, draft.id, cucumber.id, NaN, 'kg', 6)).toThrow();
    expect(() => addItemToPackage(store, draft.id, cucumber.id, 0, 'kg', 6)).toThrow();
    expect(() => addItemToPackage(store, draft.id, cucumber.id, -2, 'kg', 6)).toThrow();
  });
});

describe('packages — punkty odbioru per tydzień', () => {
  function draftWithItem(store: ReturnType<typeof createSeedData>) {
    const draft = createDraftPackage(store, 5, '2026-06-20');
    addItemToPackage(store, draft.id, findProduct(store, 'Ogórek gruntowy').id, 1, 'kg', 6);
    return draft;
  }

  it('domyślnie (null) publikacja obejmuje wszystkich — 4 ClientPackage', () => {
    const store = createSeedData();
    const draft = draftWithItem(store);
    expect(draft.pickupPointIds).toBeNull();
    const { clientPackages } = publishPackage(store, draft.id);
    expect(clientPackages.filter((c) => c.kind === 'package')).toHaveLength(4);
  });

  it('wybór podzbioru punktów ogranicza generowanie do klientów tych punktów', async () => {
    const { setPackagePickupPoints } = await import('@/lib/packages');
    const store = createSeedData();
    const draft = draftWithItem(store);
    // tylko Kąkolewice (Anna) i Komorniki (Tomasz)
    const kak = store.pickupPoints.find((p) => p.name.includes('Kąkolewice'))!;
    const kom = store.pickupPoints.find((p) => p.name === 'Komorniki')!;
    setPackagePickupPoints(store, draft.id, [kak.id, kom.id]);

    const clientPackages = publishPackage(store, draft.id).clientPackages.filter((c) => c.kind === 'package');
    expect(clientPackages).toHaveLength(2);
    const points = clientPackages.map((cp) => cp.pickupPointId).sort();
    expect(points).toEqual([kak.id, kom.id].sort());
  });

  it('klient z dostawą do domu wchodzi niezależnie od wybranych punktów', async () => {
    const { setPackagePickupPoints } = await import('@/lib/packages');
    const store = createSeedData();
    // Anna przechodzi na dostawę do domu
    const anna = store.users.find((u) => u.firstName === 'Anna')!;
    anna.deliveryOption = 'home_delivery';
    const draft = draftWithItem(store);
    const kom = store.pickupPoints.find((p) => p.name === 'Komorniki')!;
    setPackagePickupPoints(store, draft.id, [kom.id]); // tylko Komorniki

    const clientPackages = publishPackage(store, draft.id).clientPackages.filter((c) => c.kind === 'package');
    // Tomasz (Komorniki) + Anna (dostawa do domu) = 2
    expect(clientPackages).toHaveLength(2);
    expect(clientPackages.some((cp) => cp.userId === anna.id && cp.isHomeDelivery)).toBe(true);
  });

  it('publikacja z pustą listą punktów jest odrzucona', async () => {
    const { setPackagePickupPoints } = await import('@/lib/packages');
    const store = createSeedData();
    const draft = draftWithItem(store);
    setPackagePickupPoints(store, draft.id, []);
    expect(() => publishPackage(store, draft.id)).toThrow();
  });
});
