// lib/packages.ts — logika domenowa modułu "Paczka tygodnia" (MVP-3).
// Czyste funkcje operujące na obiekcie Store (mutacja in-place). UI tylko je wywołuje
// i decyduje o persystencji (saveStore). Brak side-effectów poza przekazanym store.

import { isProductAvailable } from './seed';
import type { ClientPackage, PackageItem, Store, WeeklyPackage } from './types';

// Lokalny generator ID (unikalny w obrębie procesu, bez zależności od crypto).
let _seq = 0;
function genId(prefix: string): string {
  _seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${_seq.toString(36)}`;
}

/** Miesiąc paczki wyprowadzony z daty odbioru ('YYYY-MM-DD' → 1–12). */
export function getPackageMonth(pkg: Pick<WeeklyPackage, 'pickupDate'>): number {
  return Number(pkg.pickupDate.slice(5, 7));
}

/** Czy produkt można dodać do paczki w danym miesiącu (aktywny + sezonowy). */
export function canAddProduct(productId: string, month: number, store: Store): boolean {
  const product = store.products.find((p) => p.id === productId);
  if (!product || !product.isActive) return false;
  return isProductAvailable(product, month);
}

/**
 * Tworzy nowy szkic paczki (status 'draft') i dopisuje go do store.
 * pickupDate wyznacza miesiąc sezonowości pozycji.
 */
export function createDraftPackage(
  store: Store,
  weekNumber: number,
  pickupDate: string,
  now: string = new Date().toISOString(),
): WeeklyPackage {
  const season = String(new Date(pickupDate).getUTCFullYear());
  const pkg: WeeklyPackage = {
    id: genId('wp'),
    weekNumber,
    pickupDate,
    publishedAt: null,
    swapDeadline: '',
    absenceDeadline: '',
    status: 'draft',
    season,
    createdAt: now,
  };
  store.weeklyPackages.push(pkg);
  return pkg;
}

/**
 * Dodaje pozycję (produkt + ilość + jednostka) do paczki.
 * Guard: produkt spoza sezonu danego miesiąca jest odrzucony (rzuca błędem).
 */
export function addItemToPackage(
  store: Store,
  weeklyPackageId: string,
  productId: string,
  quantity: number,
  unit: string,
  month: number,
): PackageItem {
  if (!canAddProduct(productId, month, store)) {
    throw new Error(`Produkt ${productId} jest poza sezonem w miesiącu ${month}.`);
  }
  const item: PackageItem = {
    id: genId('pi'),
    weeklyPackageId,
    productId,
    quantity,
    unit,
  };
  store.packageItems.push(item);
  return item;
}

/** Usuwa pozycję paczki ze store. */
export function removeItemFromPackage(store: Store, itemId: string): void {
  store.packageItems = store.packageItems.filter((i) => i.id !== itemId);
}

/** Pozycje należące do danej paczki. */
export function itemsForPackage(store: Store, weeklyPackageId: string): PackageItem[] {
  return store.packageItems.filter((i) => i.weeklyPackageId === weeklyPackageId);
}

/** Aktywne subskrypcje paczkowe (paczka_24 / paczka_12, status 'active'). */
export function activePackageSubscriptions(store: Store) {
  return store.subscriptions.filter(
    (s) => s.status === 'active' && (s.type === 'paczka_24' || s.type === 'paczka_12'),
  );
}

/**
 * Publikuje paczkę: status 'published' + publishedAt, oraz generuje ClientPackage
 * (status 'pending') dla każdej aktywnej subskrypcji paczkowej. Mutuje store.
 */
export function publishPackage(
  store: Store,
  weeklyPackageId: string,
  now: string = new Date().toISOString(),
): { package: WeeklyPackage; clientPackages: ClientPackage[] } {
  const pkg = store.weeklyPackages.find((w) => w.id === weeklyPackageId);
  if (!pkg) {
    throw new Error(`Brak paczki o id ${weeklyPackageId}.`);
  }

  pkg.status = 'published';
  pkg.publishedAt = now;

  const subs = activePackageSubscriptions(store);
  const generated: ClientPackage[] = subs.map((sub) => {
    const owner = store.users.find((u) => u.id === sub.userId);
    return {
      id: genId('cp'),
      weeklyPackageId,
      userId: sub.userId,
      subscriptionId: sub.id,
      status: 'pending',
      pickupPointId: owner?.defaultPickupPointId ?? null,
      isHomeDelivery: owner?.deliveryOption === 'home_delivery',
      absenceReported: false,
      absenceReportedAt: null,
      pickupConfirmedFarm: false,
      pickupConfirmedFarmAt: null,
      pickupConfirmedFarmBy: null,
      pickupConfirmedDriver: false,
      pickupConfirmedDriverAt: null,
      pickupConfirmedDriverBy: null,
      note: null,
      createdAt: now,
      updatedAt: now,
    };
  });

  store.clientPackages.push(...generated);
  return { package: pkg, clientPackages: generated };
}
