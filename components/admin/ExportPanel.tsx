'use client';

// components/admin/ExportPanel.tsx — MVP-9: eksport XLSX (4 arkusze) — TOP priorytet Magdy.

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore } from '@/lib/store';
import {
  buildHarvestRows,
  buildPackingRows,
  buildSwapRows,
  buildChickenRows,
  exportWeeklyXlsx,
} from '@/lib/export';
import type { Store } from '@/lib/types';

export function ExportPanel() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const wp = store?.weeklyPackages.find((w) => w.status === 'published') ?? null;

  const sheets = useMemo(() => {
    if (!store || !wp) return [];
    return [
      { key: 'harvest', rows: buildHarvestRows(store, wp.id).length },
      { key: 'packing', rows: buildPackingRows(store, wp.id).length },
      { key: 'swaps', rows: buildSwapRows(store, wp.id).length },
      { key: 'chickens', rows: buildChickenRows(store).length },
    ];
  }, [store, wp]);

  if (!store || !wp) {
    return (
      <section>
        <h2 className="mb-2 text-xl font-semibold">{t('admin.nav.export')}</h2>
        <p className="text-gray-600">{t('admin.export.noPackage')}</p>
      </section>
    );
  }

  const onDownload = () =>
    exportWeeklyXlsx(store, wp.id, `greenleaf-tydzien-${wp.weekNumber}.xlsx`);

  return (
    <section>
      <h2 className="mb-2 text-xl font-semibold">{t('admin.nav.export')}</h2>
      <p className="mb-4 text-gray-600">{t('admin.export.intro')}</p>

      <ul className="mb-4 divide-y divide-gray-100 rounded-xl border border-leaf-100 bg-white">
        {sheets.map((s) => (
          <li key={s.key} className="flex items-center justify-between p-3 text-sm">
            <span className="font-medium text-leaf-700">{t(`admin.export.sheet.${s.key}`)}</span>
            <span className="text-gray-500">{t('admin.export.rows', { n: s.rows })}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onDownload}
        className="rounded-lg bg-leaf-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-leaf-700"
      >
        ⬇ {t('admin.export.download')}
      </button>
    </section>
  );
}
