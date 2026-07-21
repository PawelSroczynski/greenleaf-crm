// lib/export.ts — eksport XLSX (MVP-9). Uwzględnia uwagi Magdy (F5):
// nr paczki + data w każdym arkuszu, podział na punkty odbioru + zbiór ogólny, jednostki 100g → kg.

import * as XLSX from 'xlsx';
import { itemsForPackage } from './packages';
import type { ClientPackage, Store, WeeklyPackage } from './types';

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
    if (idx >= 0) base[idx] = { ...base[idx], productId: swap.replacementProductId };
  }
  return base;
}

/** Jednostki 100g sumowane w kg (ile zebrać całościowo, nie opakowań). */
function normalize(quantity: number, unit: string): { quantity: number; unit: string } {
  if (unit === '100g') return { quantity: Math.round(quantity * 0.1 * 100) / 100, unit: 'kg' };
  return { quantity, unit };
}

const productName = (store: Store, id: string) => store.products.find((p) => p.id === id)?.name ?? id;
const userName = (store: Store, id: string) => {
  const u = store.users.find((x) => x.id === id);
  return u ? `${u.firstName} ${u.lastName}` : id;
};
const pointName = (store: Store, id: string | null) =>
  id ? store.pickupPoints.find((p) => p.id === id)?.name ?? id : 'Dostawa do domu';

function pkgMeta(store: Store, weeklyPackageId: string): Pick<WeeklyPackage, 'weekNumber' | 'pickupDate'> {
  const wp = store.weeklyPackages.find((w) => w.id === weeklyPackageId);
  return { weekNumber: wp?.weekNumber ?? 0, pickupDate: wp?.pickupDate ?? '' };
}

/** Tylko paczki warzywne (kind !== 'eggs') danego tygodnia. */
function packageCps(store: Store, weeklyPackageId: string): ClientPackage[] {
  return store.clientPackages.filter(
    (c) => c.weeklyPackageId === weeklyPackageId && c.kind !== 'eggs',
  );
}

/**
 * Arkusz „Zbiory": ile czego zebrać — z podziałem na punkty odbioru + zbiór ogólny (RAZEM).
 * Jednostki 100g przeliczone na kg. Kolumny: Tydzień, Data, Punkt, Produkt, Ilość, Jednostka.
 */
export function buildHarvestRows(store: Store, weeklyPackageId: string) {
  const { weekNumber, pickupDate } = pkgMeta(store, weeklyPackageId);
  const cps = packageCps(store, weeklyPackageId);

  // klucz: punkt → produkt → {qty, unit}
  const perPoint = new Map<string, Map<string, { qty: number; unit: string }>>();
  const grand = new Map<string, { qty: number; unit: string }>();

  for (const cp of cps) {
    const point = pointName(store, cp.pickupPointId);
    if (!perPoint.has(point)) perPoint.set(point, new Map());
    const pmap = perPoint.get(point)!;
    for (const it of effectiveItems(store, cp)) {
      const n = normalize(it.quantity, it.unit);
      const cur = pmap.get(it.productId) ?? { qty: 0, unit: n.unit };
      cur.qty += n.quantity;
      pmap.set(it.productId, cur);
      const g = grand.get(it.productId) ?? { qty: 0, unit: n.unit };
      g.qty += n.quantity;
      grand.set(it.productId, g);
    }
  }

  const rows: Record<string, string | number>[] = [];
  const mkRows = (punkt: string, map: Map<string, { qty: number; unit: string }>) =>
    [...map.entries()]
      .map(([pid, v]) => ({
        Tydzień: weekNumber,
        Data: pickupDate,
        Punkt: punkt,
        Produkt: productName(store, pid),
        Ilość: Math.round(v.qty * 100) / 100,
        Jednostka: v.unit,
      }))
      .sort((a, b) => String(a.Produkt).localeCompare(String(b.Produkt)));

  for (const [punkt, map] of [...perPoint.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    rows.push(...mkRows(punkt, map));
  }
  rows.push(...mkRows('RAZEM (wszystkie punkty)', grand));
  return rows;
}

/** Arkusz „Pakowanie": co spakować per klient, pogrupowane po punkcie odbioru. */
export function buildPackingRows(store: Store, weeklyPackageId: string) {
  const { weekNumber, pickupDate } = pkgMeta(store, weeklyPackageId);
  return packageCps(store, weeklyPackageId)
    .map((cp) => ({
      Tydzień: weekNumber,
      Data: pickupDate,
      Punkt: pointName(store, cp.pickupPointId),
      Klient: userName(store, cp.userId),
      Produkty: effectiveItems(store, cp)
        .map((i) => `${productName(store, i.productId)} ${i.quantity}${i.unit}`)
        .join(', '),
    }))
    .sort((a, b) => a.Punkt.localeCompare(b.Punkt) || a.Klient.localeCompare(b.Klient));
}

/** Arkusz „Zmiany": klient, punkt, z czego → na co, nr paczki + data. */
export function buildSwapRows(store: Store, weeklyPackageId: string) {
  const { weekNumber, pickupDate } = pkgMeta(store, weeklyPackageId);
  const cps = new Map(packageCps(store, weeklyPackageId).map((c) => [c.id, c]));
  return store.swaps
    .filter((s) => cps.has(s.clientPackageId))
    .map((s) => {
      const cp = cps.get(s.clientPackageId)!;
      return {
        Tydzień: weekNumber,
        Data: pickupDate,
        Punkt: pointName(store, cp.pickupPointId),
        Klient: userName(store, cp.userId),
        Z: productName(store, s.originalProductId),
        Na: productName(store, s.replacementProductId),
      };
    });
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

export function buildWorkbook(store: Store, weeklyPackageId: string): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(buildHarvestRows(store, weeklyPackageId)), 'Zbiory');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(buildPackingRows(store, weeklyPackageId)), 'Pakowanie');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(buildSwapRows(store, weeklyPackageId)), 'Zmiany');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(buildChickenRows(store)), 'Kurczaki');
  return wb;
}

export function exportWeeklyXlsx(store: Store, weeklyPackageId: string, filename = 'greenleaf-paczka.xlsx') {
  XLSX.writeFile(buildWorkbook(store, weeklyPackageId), filename);
}
