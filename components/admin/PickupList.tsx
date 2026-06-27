'use client';

// components/admin/PickupList.tsx — MVP-13: lista odbiorów farmy, checkbox „odebrano".
// Grupowanie po punkcie odbioru; flaga „nie zgłosił" (nie odebrał i nie zgłosił braku).

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import { markPickedUp, notPickedNotReported, pickupStatusList } from '@/lib/pickups';
import type { Store } from '@/lib/types';

export function PickupList() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [tick, setTick] = useState(0); // wymusza re-render po mutacji

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const wp = store?.weeklyPackages.find((w) => w.status === 'published') ?? null;

  const flaggedIds = useMemo(
    () => (store && wp ? new Set(notPickedNotReported(store, wp.id).map((c) => c.id)) : new Set<string>()),
    [store, wp, tick],
  );

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

  const onToggle = (clientPackageId: string) => {
    markPickedUp(store, clientPackageId, 'admin');
    saveStore(store);
    setTick((n) => n + 1);
  };

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{t('admin.nav.pickups')}</h2>
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.pointId}>
            <h3 className="mb-2 text-sm font-semibold text-leaf-700">📍 {g.name}</h3>
            <ul className="divide-y divide-gray-100 rounded-xl border border-leaf-100 bg-white">
              {g.items.map((row) => {
                const picked = row.clientPackage.status === 'picked_up';
                const flagged = flaggedIds.has(row.clientPackage.id);
                return (
                  <li key={row.clientPackage.id} className="flex items-center gap-3 p-3">
                    <input
                      type="checkbox"
                      checked={picked}
                      onChange={() => onToggle(row.clientPackage.id)}
                      aria-label={t('admin.pickups.markPicked')}
                    />
                    <span className="flex-1 text-sm">
                      {row.user ? `${row.user.firstName} ${row.user.lastName}` : row.clientPackage.userId}
                    </span>
                    {row.clientPackage.absenceReported && (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                        {t('admin.pickups.absence')}
                      </span>
                    )}
                    {flagged && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        {t('admin.pickups.notReported')}
                      </span>
                    )}
                    {picked && (
                      <span className="rounded bg-leaf-50 px-2 py-0.5 text-xs text-leaf-700">
                        {t('status.picked_up')}
                      </span>
                    )}
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
