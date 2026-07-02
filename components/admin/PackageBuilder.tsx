'use client';

// components/admin/PackageBuilder.tsx — builder "Paczki tygodnia" (MVP-3).
// Stan formularza w komponencie; cała logika domenowa w lib/packages.ts.

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import { productsAvailableInMonth } from '@/lib/seed';
import { PACKAGE_ITEM_TARGET } from '@/lib/config';
import {
  addItemToPackage,
  canAddProduct,
  createDraftPackage,
  getPackageMonth,
  itemsForPackage,
  publishPackage,
  removeItemFromPackage,
} from '@/lib/packages';
import type { ClientPackage, PackageItem, Product, Store, WeeklyPackage } from '@/lib/types';

/** Następna data odbioru = ostatnia paczka + 7 dni (deterministycznie, bez Date.now). */
function nextPickupDate(packages: WeeklyPackage[]): { weekNumber: number; pickupDate: string } {
  const latest = [...packages].sort((a, b) => a.weekNumber - b.weekNumber).at(-1);
  if (!latest) return { weekNumber: 1, pickupDate: '2026-05-23' };
  const next = new Date(`${latest.pickupDate}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 7);
  return { weekNumber: latest.weekNumber + 1, pickupDate: next.toISOString().slice(0, 10) };
}

export function PackageBuilder() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [draft, setDraft] = useState<WeeklyPackage | null>(null);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [items, setItems] = useState<PackageItem[]>([]);
  const [published, setPublished] = useState<ClientPackage[] | null>(null);

  // Inicjalizacja: wczytaj store i utwórz świeży szkic kolejnego tygodnia.
  useEffect(() => {
    const s = loadStore();
    const { weekNumber, pickupDate } = nextPickupDate(s.weeklyPackages);
    const d = createDraftPackage(s, weekNumber, pickupDate);
    setStore(s);
    setDraft(d);
    setItems(itemsForPackage(s, d.id));
  }, []);

  const month = draft ? getPackageMonth(draft) : 6;

  const seasonalProducts: Product[] = useMemo(
    () => (store ? productsAvailableInMonth(store.products, month) : []),
    [store, month],
  );

  if (!store || !draft) {
    return <p className="text-gray-600">{t('common.soon')}</p>;
  }

  const product = store.products.find((p) => p.id === productId) ?? null;

  function handleSelectProduct(id: string) {
    setProductId(id);
    const p = store!.products.find((x) => x.id === id);
    setUnit(p?.unit ?? '');
  }

  function handleAdd() {
    if (!productId || !canAddProduct(productId, month, store!)) return;
    if (!Number.isFinite(quantity) || quantity <= 0) return; // NaN po wyczyszczeniu pola liczby
    const item = addItemToPackage(store!, draft!.id, productId, quantity, unit, month);
    setItems((prev) => [...prev, item]);
    setProductId('');
    setUnit('');
    setQuantity(1);
  }

  function handleRemove(itemId: string) {
    removeItemFromPackage(store!, itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  function handlePublish() {
    const { clientPackages } = publishPackage(store!, draft!.id);
    saveStore(store!);
    setDraft({ ...draft!, status: 'published' });
    setPublished(clientPackages);
  }

  const productName = (id: string) => store.products.find((p) => p.id === id)?.name ?? id;

  return (
    <section>
      <h2 className="mb-1 text-xl font-semibold">{t('admin.package.title')}</h2>
      <p className="mb-4 text-sm text-gray-600">
        {t('admin.package.weekLine', { week: draft.weekNumber, date: draft.pickupDate })}{' '}
        <span className="rounded bg-leaf-50 px-2 py-0.5 text-xs font-semibold text-leaf-700">
          {t(`status.${draft.status}`)}
        </span>
      </p>

      {published ? (
        <div className="rounded-xl border border-leaf-200 bg-leaf-50 p-4">
          <h3 className="text-lg font-semibold text-leaf-700">{t('admin.package.published')}</h3>
          <p className="mt-1 text-sm text-gray-700">
            {t('admin.package.publishedInfo', { count: published.length })}
          </p>
          <h4 className="mt-4 mb-2 font-semibold">{t('admin.package.preview')}</h4>
          <ul className="list-disc pl-5 text-sm text-gray-800">
            {items.map((i) => (
              <li key={i.id}>
                {productName(i.productId)} — {i.quantity} {i.unit}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-2">
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-600">{t('admin.package.product')}</span>
              <select
                aria-label={t('admin.package.product')}
                value={productId}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="rounded border border-leaf-200 px-2 py-1.5"
              >
                <option value="">{t('admin.package.selectProduct')}</option>
                {seasonalProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-600">{t('admin.package.quantity')}</span>
              <input
                type="number"
                min={1}
                aria-label={t('admin.package.quantity')}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 rounded border border-leaf-200 px-2 py-1.5"
              />
            </label>

            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-600">{t('admin.package.unit')}</span>
              <input
                aria-label={t('admin.package.unit')}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-24 rounded border border-leaf-200 px-2 py-1.5"
              />
            </label>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!product}
              className="rounded bg-leaf-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
            >
              {t('admin.package.add')}
            </button>
          </div>

          <p className="mb-2 text-sm font-medium text-gray-700">
            {t('admin.package.itemCount', {
              count: items.length,
              min: PACKAGE_ITEM_TARGET.min,
              max: PACKAGE_ITEM_TARGET.max,
            })}
          </p>

          {items.length === 0 ? (
            <p className="mb-4 text-sm text-gray-500">{t('admin.package.empty')}</p>
          ) : (
            <ul className="mb-4 divide-y divide-leaf-100 rounded-xl border border-leaf-100 bg-white">
              {items.map((i) => (
                <li key={i.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span>
                    {productName(i.productId)} — {i.quantity} {i.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(i.id)}
                    className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    {t('admin.package.remove')}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={handlePublish}
            disabled={items.length === 0}
            className="rounded bg-leaf-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {t('admin.package.publish')}
          </button>
        </>
      )}
    </section>
  );
}
