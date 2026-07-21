'use client';

// components/admin/PackageHistory.tsx — Pulpit: historia paczek które już były + ich skład (uwaga Magdy F7).

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore } from '@/lib/store';
import { itemsForPackage } from '@/lib/packages';
import { pickupWeeks } from '@/lib/pickups';
import type { Store } from '@/lib/types';

export function PackageHistory() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const weeks = useMemo(
    () => (store ? [...pickupWeeks(store)].sort((a, b) => b.weekNumber - a.weekNumber) : []),
    [store],
  );
  if (!store) return null;

  const productName = (id: string) => store.products.find((p) => p.id === id)?.name ?? id;

  return (
    <section className="mt-6">
      <h3 className="mb-2 text-sm font-semibold text-gray-700">{t('admin.history.title')}</h3>
      <ul className="divide-y divide-gray-100 rounded-xl border border-leaf-100 bg-white">
        {weeks.map((w) => {
          const items = itemsForPackage(store, w.id);
          const open = openId === w.id;
          return (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : w.id)}
                className="flex w-full items-center justify-between p-3 text-left text-sm hover:bg-leaf-50"
              >
                <span>
                  <span className="font-medium">
                    {t('admin.history.week', { week: w.weekNumber })}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">{w.pickupDate}</span>
                </span>
                <span className="text-xs text-gray-500">
                  {t('admin.history.itemCount', { n: items.length })} {open ? '▲' : '▼'}
                </span>
              </button>
              {open && (
                <ul className="list-disc px-8 pb-3 text-sm text-gray-700">
                  {items.map((i) => (
                    <li key={i.id}>
                      {productName(i.productId)} — {i.quantity} {i.unit}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
