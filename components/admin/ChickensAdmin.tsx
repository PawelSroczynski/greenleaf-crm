'use client';

// components/admin/ChickensAdmin.tsx — kurczaki (F9): lista zapisów per partia dla admina.

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore } from '@/lib/store';
import { chickenBatches, reservationsForBatch } from '@/lib/chickens';
import type { Store } from '@/lib/types';

export function ChickensAdmin() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const batches = useMemo(() => chickenBatches(), []);
  if (!store) return null;

  const userName = (id: string) => {
    const u = store.users.find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : id;
  };

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{t('admin.nav.chickens')}</h2>
      <div className="space-y-4">
        {batches.map((b, i) => {
          const res = reservationsForBatch(store, b.batch);
          const total = res.reduce((sum, r) => sum + r.carcassCount, 0);
          return (
            <div key={b.batch}>
              <h3 className="mb-1 text-sm font-semibold text-leaf-700">
                {t('client.chickens.batch', { n: i + 1 })} · {b.plannedDate} ·{' '}
                {t('admin.chickens.total', { n: total })}
              </h3>
              {res.length === 0 ? (
                <p className="text-sm text-gray-500">{t('admin.chickens.noReservations')}</p>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-xl border border-leaf-100 bg-white text-sm">
                  {res.map((r) => (
                    <li key={r.id} className="flex items-center justify-between p-3">
                      <span>{userName(r.userId)}</span>
                      <span className="text-gray-600">
                        {r.carcassCount} {t('admin.chickens.pcs')}
                        {r.wantsGiblets && ` + ${t('client.chickens.giblets')}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
