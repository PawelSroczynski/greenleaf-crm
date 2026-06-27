// lib/export.ts — eksport XLSX (MVP-9, TOP priorytet Magdy). SheetJS.
// Czyste funkcje budujące wiersze 4 arkuszy (Zbiory/Pakowanie/Zmiany/Kurczaki) — testowalne bez przeglądarki.
// Faktyczne generowanie pliku (Blob/pobranie) w buildWorkbook/exportWeeklyXlsx.

import * as XLSX from 'xlsx';
import { itemsForPackage } from './packages';
import type { ClientPackage, Store } from './types';

/** Efektywne pozycje paczki klienta = pozycje bazowe z zastosowanymi jego zamianami. */
function effectiveItems(store: Store, cp: ClientPackage): { productId: string; quantity: number; unit: string }[] {
  const base = itemsForPackage(store, cp.weeklyPackageId).map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    unit: i.unit,
  }));
  const swaps = store.swaps.filter((s) => s.clientPackageId === cp.id);
  for (const swap of swaps) {
    const idx = base.findIndex((b) => b.productId === swap.originalProductId);
    if (idx >= 0) {
      base[idx] = { ...base[idx], productId: swap.replacementProductId };
    }
  }
  return base;
}

const productName = (store: Store, id: string) => store.products.find((p) => p.id === id)?.name ?? id;
const userName = (store: Store, id: string) => {
  const u = store.users.find((x) => x.id === id);
  return u ? `${u.firstName} ${u.lastName}` : id;
};
const pointName = (store: Store, id: string | null) =>
  id ? store.pickupPoints.find((p) => p.id === id)?.name ?? id : '—';

/** Arkusz „Zbiory": ile czego zebrać łącznie (po zamianach). */
export function buildHarvestRows(store: Store, weeklyPackageId: string) {
  const cps = store.clientPackages.filter((c) => c.weeklyPackageId === weeklyPackageId);
  const totals = new Map<string, { unit: string; qty: number }>();
  for (const cp of cps) {
    for (const it of effectiveItems(store, cp)) {
      const cur = totals.get(it.productId) ?? { unit: it.unit, qty: 0 };
      cur.qty += it.quantity;
      totals.set(it.productId, cur);
    }
  }
  return [...totals.entries()]
    .map(([productId, v]) => ({ Produkt: productName(store, productId), Ilość: v.qty, Jednostka: v.unit }))
    .sort((a, b) => a.Produkt.localeCompare(b.Produkt));
}

/** Arkusz „Pakowanie": co spakować dla każdego klienta (po zamianach). */
export function buildPackingRows(store: Store, weeklyPackageId: string) {
  const cps = store.clientPackages.filter((c) => c.weeklyPackageId === weeklyPackageId);
  return cps.map((cp) => ({
    Klient: userName(store, cp.userId),
    Punkt: pointName(store, cp.pickupPointId),
    Produkty: effectiveItems(store, cp)
      .map((i) => `${productName(store, i.productId)} ${i.quantity}${i.unit}`)
      .join(', '),
  }));
}

/** Arkusz „Zmiany": lista zamian (klient, z czego, na co). */
export function buildSwapRows(store: Store, weeklyPackageId: string) {
  const cpIds = new Map(
    store.clientPackages.filter((c) => c.weeklyPackageId === weeklyPackageId).map((c) => [c.id, c.userId]),
  );
  return store.swaps
    .filter((s) => cpIds.has(s.clientPackageId))
    .map((s) => ({
      Klient: userName(store, cpIds.get(s.clientPackageId)!),
      Z: productName(store, s.originalProductId),
      Na: productName(store, s.replacementProductId),
    }));
}

/** Arkusz „Kurczaki": rezerwacje kurczaków. */
export function buildChickenRows(store: Store) {
  return store.chickenReservations.map((r) => ({
    Klient: userName(store, r.userId),
    Partia: r.batch,
    Sztuk: r.carcassCount,
    'Waga (kg)': r.actualWeightKg ?? '',
    'Kwota (zł)': r.totalAmount ?? '',
  }));
}

/** Składa skoroszyt z 4 arkuszami. */
export function buildWorkbook(store: Store, weeklyPackageId: string): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(buildHarvestRows(store, weeklyPackageId)), 'Zbiory');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(buildPackingRows(store, weeklyPackageId)), 'Pakowanie');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(buildSwapRows(store, weeklyPackageId)), 'Zmiany');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(buildChickenRows(store)), 'Kurczaki');
  return wb;
}

/** Generuje i pobiera plik .xlsx (przeglądarka). */
export function exportWeeklyXlsx(store: Store, weeklyPackageId: string, filename = 'greenleaf-paczka.xlsx') {
  const wb = buildWorkbook(store, weeklyPackageId);
  XLSX.writeFile(wb, filename);
}
