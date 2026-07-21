'use client';

// components/client/SwapPanel.tsx — moduł ZAMIAN klienta RWS (MVP-4), Wariant A (wybór Magdy).
// Lista pozycji: każdą można zamienić (Zmień) i cofnąć (Cofnij) do terminu środa 20:00.
// "Symulowany czas": przełącznik przestawia `now` przed/po terminie (deadline z seed jest w przeszłości).

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import { itemsForPackage } from '@/lib/packages';
import {
  applySwap,
  cancelSwap,
  getSwapDeadline,
  isSwapOpen,
  swapOptionsForItem,
  swapsForClientPackage,
} from '@/lib/swaps';
import type { ClientPackage, PackageItem, Store, Swap, WeeklyPackage } from '@/lib/types';

/** Bieżący klient = pierwszy aktywny klient_rws z ClientPackage opublikowanej paczki (Anna). */
function findCurrent(store: Store): { cp: ClientPackage; wp: WeeklyPackage } | null {
  const wp = store.weeklyPackages.find((w) => w.status === 'published');
  if (!wp) return null;
  const rwsIds = new Set(
    store.users.filter((u) => u.role === 'klient_rws' && u.isActive).map((u) => u.id),
  );
  const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id && rwsIds.has(c.userId));
  return cp ? { cp, wp } : null;
}

/** `now` symulowany: minutę przed / po terminie zamian. */
function simulatedNow(wp: Pick<WeeklyPackage, 'pickupDate'>, afterDeadline: boolean): Date {
  const deadline = getSwapDeadline(wp).getTime();
  return new Date(afterDeadline ? deadline + 60_000 : deadline - 60_000);
}

export function SwapPanel() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [cp, setCp] = useState<ClientPackage | null>(null);
  const [wp, setWp] = useState<WeeklyPackage | null>(null);
  const [items, setItems] = useState<PackageItem[]>([]);
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [afterDeadline, setAfterDeadline] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  useEffect(() => {
    const s = loadStore();
    const cur = findCurrent(s);
    setStore(s);
    if (cur) {
      setCp(cur.cp);
      setWp(cur.wp);
      setItems(itemsForPackage(s, cur.wp.id));
      setSwaps(swapsForClientPackage(s, cur.cp.id));
    }
  }, []);

  if (!store || !cp || !wp) {
    return <p className="text-gray-600">{t('common.soon')}</p>;
  }

  const productName = (id: string) => store.products.find((p) => p.id === id)?.name ?? id;
  const open = isSwapOpen(wp, simulatedNow(wp, afterDeadline));
  const swapForItem = (productId: string) =>
    swaps.find((s) => s.clientPackageId === cp.id && s.originalProductId === productId) ?? null;
  const optionsForItem = (item: PackageItem) => swapOptionsForItem(store, cp.id, item);

  function doSwap(original: string, replacement: string) {
    if (!replacement) return;
    const now = simulatedNow(wp!, afterDeadline);
    try {
      applySwap(store!, cp!.id, original, replacement, now);
      saveStore(store!);
      setSwaps([...swapsForClientPackage(store!, cp!.id)]);
    } catch {
      /* po terminie / niedozwolony — kontrolki i tak zablokowane */
    }
    setOpenItemId(null);
  }

  function undo(original: string) {
    const now = simulatedNow(wp!, afterDeadline);
    try {
      cancelSwap(store!, cp!.id, original, now);
      saveStore(store!);
      setSwaps([...swapsForClientPackage(store!, cp!.id)]);
    } catch {
      /* po terminie */
    }
  }

  return (
    <section>
      <h2 className="mb-1 text-xl font-semibold">{t('client.swap.title')}</h2>
      <p className="mb-3 text-sm text-gray-600">
        {t('client.swap.weekLine', { week: wp.weekNumber, date: wp.pickupDate })}
      </p>

      <label className="mb-3 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={afterDeadline}
          onChange={(e) => setAfterDeadline(e.target.checked)}
        />
        {t('client.swap.simulateAfter')}
      </label>

      <p
        className={`mb-4 rounded px-2 py-1 text-sm font-semibold ${
          open ? 'bg-leaf-50 text-leaf-700' : 'bg-red-50 text-red-700'
        }`}
      >
        {open ? t('client.swap.open') : t('client.swap.closed')}
      </p>

      <ul className="divide-y divide-leaf-100 rounded-xl border border-leaf-100 bg-white">
        {items.map((i) => {
          const swap = swapForItem(i.productId);
          const options = optionsForItem(i);
          return (
            <li key={i.id} className="px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span>{productName(i.productId)}</span>
                <span className="flex items-center gap-2">
                  {swap && (
                    <span className="text-leaf-700">
                      {t('client.swap.swappedTo', { name: productName(swap.replacementProductId) })}
                    </span>
                  )}
                  {open && options.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setOpenItemId(openItemId === i.id ? null : i.id)}
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        swap
                          ? 'border border-leaf-300 text-leaf-700 hover:bg-leaf-50'
                          : 'bg-leaf-600 text-white'
                      }`}
                    >
                      {swap ? t('client.swap.change') : t('client.swap.swap')}
                    </button>
                  )}
                  {open && swap && (
                    <button
                      type="button"
                      onClick={() => undo(i.productId)}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      {t('client.swap.cancel')}
                    </button>
                  )}
                </span>
              </div>
              {open && openItemId === i.id && (
                <select
                  aria-label={`${t('client.swap.replacement')}: ${productName(i.productId)}`}
                  defaultValue=""
                  onChange={(e) => e.target.value && doSwap(i.productId, e.target.value)}
                  className="mt-2 w-full rounded border border-leaf-200 px-2 py-1.5"
                >
                  <option value="">{t('client.swap.selectReplacement')}</option>
                  {options.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
