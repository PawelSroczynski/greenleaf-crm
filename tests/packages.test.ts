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
    const { package: pkg } = publishPackage(store, draft.id, '2026-06-16T10:00:00.000Z');
    expect(pkg.status).toBe('published');
    expect(pkg.publishedAt).toBe('2026-06-16T10:00:00.000Z');
  });

  it('publishPackage generuje 1 ClientPackage (status pending) na aktywną subskrypcję paczkową', () => {
    const store = createSeedData();
    const draft = createDraftPackage(store, 5, '2026-06-20');
    const before = store.clientPackages.length;

    const { clientPackages } = publishPackage(store, draft.id);

    expect(clientPackages).toHaveLength(4);
    expect(clientPackages.every((cp) => cp.status === 'pending')).toBe(true);
    expect(clientPackages.every((cp) => cp.weeklyPackageId === draft.id)).toBe(true);
    // każda aktywna subskrypcja paczkowa ma dokładnie jeden ClientPackage dla tej paczki
    const subIds = activePackageSubscriptions(store).map((s) => s.id).sort();
    const cpSubIds = clientPackages.map((cp) => cp.subscriptionId).sort();
    expect(cpSubIds).toEqual(subIds);
    expect(store.clientPackages.length).toBe(before + 4);
  });

  it('zmiany są utrwalone w store (saveStore → loadStore)', () => {
    localStorage.clear();
    const store = loadStore();
    const draft = createDraftPackage(store, 9, '2026-06-27');
    publishPackage(store, draft.id, '2026-06-23T10:00:00.000Z');
    saveStore(store);

    const reloaded = loadStore();
    const reloadedPkg = reloaded.weeklyPackages.find((w) => w.id === draft.id);
    expect(reloadedPkg?.status).toBe('published');
    expect(reloaded.clientPackages.filter((cp) => cp.weeklyPackageId === draft.id)).toHaveLength(4);
  });
});
