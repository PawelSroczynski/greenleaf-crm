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

  it('Zbiory: wiersz RAZEM agreguje ilość = ilość bazowa × liczba paczek', () => {
    const { store, wp } = setup();
    const cps = store.clientPackages.filter((c) => c.weeklyPackageId === wp.id && c.kind !== 'eggs');
    const firstItem = itemsForPackage(store, wp.id).find((i) => !i.substituteIds && !(i.alternativeIds && i.alternativeIds.length))!;
    const rows = buildHarvestRows(store, wp.id);
    const productName = store.products.find((p) => p.id === firstItem.productId)!.name;
    const razem = rows.find((r) => String(r.Punkt).startsWith('RAZEM') && r.Produkt === productName)!;
    expect(razem.Ilość).toBe(firstItem.quantity * cps.length);
  });

  it('Zbiory: zawiera kolumny Tydzień, Data, Punkt oraz podział per punkt', () => {
    const { store, wp } = setup();
    const rows = buildHarvestRows(store, wp.id);
    expect(rows[0]).toHaveProperty('Tydzień');
    expect(rows[0]).toHaveProperty('Data');
    expect(rows[0]).toHaveProperty('Punkt');
    expect(rows.some((r) => String(r.Punkt).startsWith('RAZEM'))).toBe(true);
    expect(rows.some((r) => r.Punkt === 'Kąkolewice 17a')).toBe(true);
  });

  it('Pakowanie: po wierszu na każdego klienta (paczki, bez jajek), z punktem i datą', () => {
    const { store, wp } = setup();
    const cps = store.clientPackages.filter((c) => c.weeklyPackageId === wp.id && c.kind !== 'eggs');
    const rows = buildPackingRows(store, wp.id);
    expect(rows).toHaveLength(cps.length);
    expect(rows[0]).toHaveProperty('Punkt');
    expect(rows[0]).toHaveProperty('Data');
  });

  it('Zmiany: odzwierciedla wykonaną zamianę', () => {
    const { store, wp } = setup();
    const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id)!;
    const before = new Date(getSwapDeadline(wp).getTime() - 60_000);
    const repl = replacementOptions(store, cp.id)[0];
    const original = itemsForPackage(store, wp.id).find((i) => !i.substituteIds && !(i.alternativeIds && i.alternativeIds.length))!;
    applySwap(store, cp.id, original.productId, repl.id, before);

    const rows = buildSwapRows(store, wp.id);
    expect(rows).toHaveLength(1);
    expect(rows[0].Na).toBe(repl.name);
  });
});
