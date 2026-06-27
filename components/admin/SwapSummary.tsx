'use client';

// components/admin/SwapSummary.tsx — podsumowanie zamian dla admina (MVP-4).
// "ile czego przygotować po zamianach" dla opublikowanej paczki.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore } from '@/lib/store';
import { swapSummary, type SwapSummaryRow } from '@/lib/swaps';

export function SwapSummary() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<SwapSummaryRow[] | null>(null);

  useEffect(() => {
    const store = loadStore();
    const wp = store.weeklyPackages.find((w) => w.status === 'published');
    setRows(wp ? swapSummary(store, wp.id) : []);
  }, []);

  if (!rows) return null;

  return (
    <section className="mt-8 border-t border-leaf-100 pt-6">
      <h3 className="mb-3 text-lg font-semibold">{t('admin.swaps.title')}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">{t('admin.swaps.empty')}</p>
      ) : (
        <table className="w-full max-w-md text-left text-sm">
          <thead>
            <tr className="border-b border-leaf-100 text-gray-600">
              <th className="py-1 pr-4 font-medium">{t('admin.swaps.product')}</th>
              <th className="py-1 pr-4 font-medium">{t('admin.swaps.out')}</th>
              <th className="py-1 font-medium">{t('admin.swaps.in')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.productId} className="border-b border-leaf-50">
                <td className="py-1 pr-4">{r.name}</td>
                <td className="py-1 pr-4">{r.out}</td>
                <td className="py-1">{r.in}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
