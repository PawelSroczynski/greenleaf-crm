import { describe, it, expect } from 'vitest';
import { createSeedData } from '@/lib/seed';
import { itemsForPackage } from '@/lib/packages';
import { applySwap, getSwapDeadline, replacementOptions } from '@/lib/swaps';
import {
  buildHarvestRows,
  buildPackingRows,
  buildSwapRows,
  buildWorkbook,
} from '@/lib/export';

function setup() {
  const store = createSeedData();
  const wp = store.weeklyPackages.find((w) => w.status === 'published')!;
  return { store, wp };
}

describe('export XLSX (MVP-9)', () => {
  it('buildWorkbook ma 4 arkusze o nazwach Zbiory/Pakowanie/Zmiany/Kurczaki', () => {
    const { store, wp } = setup();
    const wb = buildWorkbook(store, wp.id);
    expect(wb.SheetNames).toEqual(['Zbiory', 'Pakowanie', 'Zmiany', 'Kurczaki']);
  });

  it('Zbiory: agreguje ilość = ilość bazowa × liczba paczek klientów', () => {
    const { store, wp } = setup();
    const cps = store.clientPackages.filter((c) => c.weeklyPackageId === wp.id);
    const firstItem = itemsForPackage(store, wp.id)[0];
    const rows = buildHarvestRows(store, wp.id);
    const productName = store.products.find((p) => p.id === firstItem.productId)!.name;
    const row = rows.find((r) => r.Produkt === productName)!;
    expect(row.Ilość).toBe(firstItem.quantity * cps.length);
  });

  it('Pakowanie: po wierszu na każdego klienta', () => {
    const { store, wp } = setup();
    const cps = store.clientPackages.filter((c) => c.weeklyPackageId === wp.id);
    expect(buildPackingRows(store, wp.id)).toHaveLength(cps.length);
  });

  it('Zmiany: odzwierciedla wykonaną zamianę', () => {
    const { store, wp } = setup();
    const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id)!;
    const before = new Date(getSwapDeadline(wp).getTime() - 60_000);
    const repl = replacementOptions(store, cp.id)[0];
    const original = itemsForPackage(store, wp.id)[0];
    applySwap(store, cp.id, original.productId, repl.id, before);

    const rows = buildSwapRows(store, wp.id);
    expect(rows).toHaveLength(1);
    expect(rows[0].Na).toBe(repl.name);
  });
});
