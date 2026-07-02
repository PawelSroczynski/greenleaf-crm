'use client';

// components/admin/PickupList.tsx — MVP-13: lista odbiorów farmy, checkbox „odebrano".
// Grupowanie po punkcie odbioru; jeden wykluczający się status na wiersz + legenda
// (Odebrana / Nie odbierze — zgłoszone / Czeka na odbiór, bez zgłoszenia).

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import { markPickedUp, undoPickedUp, pickupStatusList } from '@/lib/pickups';
import type { Store } from '@/lib/types';

export function PickupList() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [tick, setTick] = useState(0); // wymusza re-render po mutacji

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const wp = store?.weeklyPackages.find((w) => w.status === 'published') ?? null;

  const groups = useMemo(() => {
    if (!store || !wp) return [];
    const rows = pickupStatusList(store, wp.id);
    const byPoint = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = row.pickupPointId ?? '__none__';
      if (!byPoint.has(key)) byPoint.set(key, []);
      byPoint.get(key)!.push(row);
    }
    return [...byPoint.entries()].map(([pointId, items]) => ({
      pointId,
      name:
        store.pickupPoints.find((p) => p.id === pointId)?.name ??
        t('admin.pickups.homeOrUnknown'),
      items,
    }));
  }, [store, wp, tick, t]);

  if (!store || !wp) {
    return <p className="text-gray-600">{t('admin.pickups.noPackage')}</p>;
  }

  const onToggle = (clientPackageId: string, picked: boolean) => {
    if (picked) {
      undoPickedUp(store, clientPackageId); // odklik = cofnięcie (misklik)
    } else {
      markPickedUp(store, clientPackageId, 'admin');
    }
    saveStore(store);
    setTick((n) => n + 1);
  };

  // Jeden wykluczający się status na wiersz — zamiast nakładających się chipów.
  const rowStatus = (row: (typeof groups)[number]['items'][number]) => {
    if (row.clientPackage.status === 'picked_up') {
      return { key: 'admin.pickups.statusPicked', cls: 'bg-leaf-50 text-leaf-700' };
    }
    if (row.clientPackage.absenceReported) {
      return { key: 'admin.pickups.statusAbsence', cls: 'bg-amber-100 text-amber-800' };
    }
    return { key: 'admin.pickups.statusWaiting', cls: 'bg-gray-100 text-gray-600' };
  };

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{t('admin.nav.pickups')}</h2>

      {/* Legenda: co oznaczają statusy + reguła braku zgłoszenia */}
      <div className="mb-4 rounded-xl border border-leaf-100 bg-white p-3 text-xs text-gray-600">
        <p className="mb-1">
          <span className="mr-1 rounded bg-leaf-50 px-2 py-0.5 font-medium text-leaf-700">
            {t('admin.pickups.statusPicked')}
          </span>
          — {t('admin.pickups.legendPicked')}
        </p>
        <p className="mb-1">
          <span className="mr-1 rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
            {t('admin.pickups.statusAbsence')}
          </span>
          — {t('admin.pickups.legendAbsence')}
        </p>
        <p>
          <span className="mr-1 rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
            {t('admin.pickups.statusWaiting')}
          </span>
          — {t('admin.pickups.legendWaiting')}
        </p>
      </div>

      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.pointId}>
            <h3 className="mb-2 text-sm font-semibold text-leaf-700">📍 {g.name}</h3>
            <ul className="divide-y divide-gray-100 rounded-xl border border-leaf-100 bg-white">
              {g.items.map((row) => {
                const picked = row.clientPackage.status === 'picked_up';
                const status = rowStatus(row);
                return (
                  <li key={row.clientPackage.id} className="flex items-center gap-3 p-3">
                    <input
                      type="checkbox"
                      checked={picked}
                      onChange={() => onToggle(row.clientPackage.id, picked)}
                      aria-label={t('admin.pickups.markPicked')}
                    />
                    <span className="flex-1 text-sm">
                      {row.user ? `${row.user.firstName} ${row.user.lastName}` : row.clientPackage.userId}
                    </span>
                    <span className={`rounded px-2 py-0.5 text-xs ${status.cls}`}>
                      {t(status.key)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
