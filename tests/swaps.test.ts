import { describe, it, expect } from 'vitest';
import { createSeedData } from '@/lib/seed';
import {
  getSwapDeadline,
  isSwapOpen,
  replacementOptions,
  applySwap,
  swapSummary,
  swapsForClientPackage,
} from '@/lib/swaps';
import { itemsForPackage } from '@/lib/packages';
import type { Store } from '@/lib/types';

// Seed: WeeklyPackage tydzień 4, pickupDate 2026-06-13 (sobota), miesiąc 6 (czerwiec).
// Termin zamian = środa 2026-06-10 20:00 (SWAP_DEADLINE).

function annaClientPackage(store: Store) {
  const rwsIds = new Set(store.users.filter((u) => u.role === 'klient_rws').map((u) => u.id));
  const cp = store.clientPackages.find((c) => rwsIds.has(c.userId));
  if (!cp) throw new Error('Brak ClientPackage dla klienta RWS w seed.');
  return cp;
}

function product(store: Store, name: string) {
  const p = store.products.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (!p) throw new Error(`Brak produktu w seed: ${name}`);
  return p;
}

describe('swaps — getSwapDeadline / isSwapOpen', () => {
  it('getSwapDeadline wyznacza środę 20:00 tygodnia paczki (2026-06-10T20:00Z)', () => {
    const store = createSeedData();
    const wp = store.weeklyPackages[0];
    expect(getSwapDeadline(wp).toISOString()).toBe('2026-06-10T20:00:00.000Z');
  });

  it('isSwapOpen: środa 19:59 → otwarte; 20:01 → zamknięte', () => {
    const store = createSeedData();
    const wp = store.weeklyPackages[0];
    expect(isSwapOpen(wp, new Date('2026-06-10T19:59:00.000Z'))).toBe(true);
    expect(isSwapOpen(wp, new Date('2026-06-10T20:01:00.000Z'))).toBe(false);
  });
});

describe('swaps — replacementOptions', () => {
  it('zawiera produkty sezonowe (czerwiec) spoza paczki, NIE zawiera niesezonowych (pomidor) ani pozycji już w paczce', () => {
    const store = createSeedData();
    const cp = annaClientPackage(store);
    const opts = replacementOptions(store, cp.id);
    const names = opts.map((p) => p.name);

    // produkt sezonowy w czerwcu i spoza paczki
    expect(names).toContain('Ogórek gruntowy');
    // pomidor niedostępny w czerwcu — wykluczony
    expect(names).not.toContain('Pomidor');
    // pozycja już w paczce (Rzodkiewka jest w seedowych itemach) — wykluczona z zamienników
    const rzodkiewka = product(store, 'Rzodkiewka');
    const inPackage = store.packageItems.some(
      (i) => i.weeklyPackageId === cp.weeklyPackageId && i.productId === rzodkiewka.id,
    );
    expect(inPackage).toBe(true);
    expect(names).not.toContain('Rzodkiewka');
  });
});

describe('swaps — applySwap', () => {
  const before = new Date('2026-06-10T19:00:00.000Z');
  const after = new Date('2026-06-10T21:00:00.000Z');

  it('przed terminem zapisuje Swap przypięty do ClientPackage', () => {
    const store = createSeedData();
    const cp = annaClientPackage(store);
    const original = store.packageItems.find((i) => i.weeklyPackageId === cp.weeklyPackageId)!;
    const replacement = product(store, 'Ogórek gruntowy');

    applySwap(store, cp.id, original.productId, replacement.id, before);

    const swaps = swapsForClientPackage(store, cp.id);
    expect(swaps).toHaveLength(1);
    expect(swaps[0].originalProductId).toBe(original.productId);
    expect(swaps[0].replacementProductId).toBe(replacement.id);
    expect(swaps[0].createdAt).toBe(before.toISOString());
  });

  it('po terminie RZUCA błędem i nie zapisuje', () => {
    const store = createSeedData();
    const cp = annaClientPackage(store);
    const original = store.packageItems.find((i) => i.weeklyPackageId === cp.weeklyPackageId)!;
    const replacement = product(store, 'Ogórek gruntowy');

    expect(() => applySwap(store, cp.id, original.productId, replacement.id, after)).toThrow();
    expect(swapsForClientPackage(store, cp.id)).toHaveLength(0);
  });

  it('odrzuca zamiennik spoza listy sezonowej (pomidor w czerwcu)', () => {
    const store = createSeedData();
    const cp = annaClientPackage(store);
    const original = store.packageItems.find((i) => i.weeklyPackageId === cp.weeklyPackageId)!;
    const tomato = product(store, 'Pomidor');

    expect(() => applySwap(store, cp.id, original.productId, tomato.id, before)).toThrow();
  });

  it('idempotencja: kolejna zamiana tego samego oryginału AKTUALIZUJE istniejący Swap', () => {
    const store = createSeedData();
    const cp = annaClientPackage(store);
    const original = store.packageItems.find((i) => i.weeklyPackageId === cp.weeklyPackageId)!;
    const first = product(store, 'Ogórek gruntowy');
    const second = product(store, 'Cukinia');

    applySwap(store, cp.id, original.productId, first.id, before);
    applySwap(store, cp.id, original.productId, second.id, before);

    const swaps = swapsForClientPackage(store, cp.id);
    expect(swaps).toHaveLength(1);
    expect(swaps[0].replacementProductId).toBe(second.id);
  });
});

describe('swaps — swapSummary', () => {
  it('agreguje: 1 zamiana → original wychodzi 1, replacement wchodzi 1', () => {
    const store = createSeedData();
    const cp = annaClientPackage(store);
    const marchew = product(store, 'Młoda marchew'); // w paczce (sezonowa)
    const burak = product(store, 'Burak ćwikłowy');

    // Bezpośredni wpis do store (test agregacji, niezależny od walidacji options).
    store.swaps.push({
      id: 'swap_test_1',
      clientPackageId: cp.id,
      originalProductId: marchew.id,
      replacementProductId: burak.id,
      createdAt: '2026-06-10T19:00:00.000Z',
    });

    const summary = swapSummary(store, cp.weeklyPackageId);
    const out = summary.find((r) => r.productId === marchew.id);
    const inn = summary.find((r) => r.productId === burak.id);
    expect(out?.out).toBe(1);
    expect(out?.in).toBe(0);
    expect(inn?.in).toBe(1);
    expect(inn?.out).toBe(0);
  });
});

describe('swaps — rozmyślenie się (zmiana i cofnięcie do terminu)', () => {
  function setup() {
    const store = createSeedData();
    const wp = store.weeklyPackages.find((w) => w.status === 'published')!;
    const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id)!;
    const before = new Date(getSwapDeadline(wp).getTime() - 60_000);
    const after = new Date(getSwapDeadline(wp).getTime() + 60_000);
    const original = itemsForPackage(store, wp.id)[0].productId;
    return { store, wp, cp, before, after, original };
  }

  it('cancelSwap przed terminem usuwa zamianę (powrót do oryginału)', async () => {
    const { cancelSwap } = await import('@/lib/swaps');
    const { store, cp, before, original } = setup();
    const repl = replacementOptions(store, cp.id)[0];
    applySwap(store, cp.id, original, repl.id, before);
    expect(store.swaps).toHaveLength(1);

    cancelSwap(store, cp.id, original, before);
    expect(store.swaps).toHaveLength(0);
  });

  it('cancelSwap po terminie odrzuca', async () => {
    const { cancelSwap } = await import('@/lib/swaps');
    const { store, cp, before, after, original } = setup();
    applySwap(store, cp.id, original, replacementOptions(store, cp.id)[0].id, before);
    expect(() => cancelSwap(store, cp.id, original, after)).toThrow();
  });

  it('po cofnięciu można zamienić ponownie (na coś innego)', async () => {
    const { cancelSwap } = await import('@/lib/swaps');
    const { store, cp, before, original } = setup();
    const opts = replacementOptions(store, cp.id);
    applySwap(store, cp.id, original, opts[0].id, before);
    cancelSwap(store, cp.id, original, before);
    applySwap(store, cp.id, original, opts[1].id, before);
    expect(store.swaps).toHaveLength(1);
    expect(store.swaps[0].replacementProductId).toBe(opts[1].id);
  });
});
