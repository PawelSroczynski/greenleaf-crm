'use client';

// components/client/ChickensPanel.tsx — kurczaki (F9): partie + zapisy klienta.

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import { findCurrentClient } from '@/lib/pickups';
import { chickenBatches, reserveChicken, reservationsForUser, cancelReservation } from '@/lib/chickens';
import type { Store, User } from '@/lib/types';

export function ChickensPanel() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [tick, setTick] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [giblets, setGiblets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const s = loadStore();
    setStore(s);
    setUser(findCurrentClient(s)?.user ?? null);
  }, []);

  const myReservations = useMemo(
    () => (store && user ? reservationsForUser(store, user.id) : []),
    [store, user, tick],
  );
  if (!store || !user) return null;

  const reserve = (batch: string) => {
    const n = counts[batch] ?? 1;
    try {
      reserveChicken(store, user.id, batch as never, n, giblets[batch] ?? false);
      saveStore(store);
      setTick((x) => x + 1);
    } catch {
      /* liczba tuszek ≤ 0 */
    }
  };
  const cancel = (id: string) => {
    cancelReservation(store, id);
    saveStore(store);
    setTick((x) => x + 1);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{t('client.chickens.title')}</h2>

      <ul className="space-y-2">
        {chickenBatches().map((b, i) => {
          const mine = myReservations.filter((r) => r.batch === b.batch);
          return (
            <li key={b.batch} className="rounded-xl border border-leaf-100 bg-white p-3 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{t('client.chickens.batch', { n: i + 1 })}</span>
                <span className="text-xs text-gray-500">{b.plannedDate}</span>
              </div>
              {mine.length === 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    {t('client.chickens.count')}
                    <input
                      type="number"
                      min={1}
                      value={counts[b.batch] ?? 1}
                      onChange={(e) => setCounts({ ...counts, [b.batch]: Number(e.target.value) })}
                      aria-label={`${t('client.chickens.count')} — ${b.batch}`}
                      className="w-16 rounded border border-gray-300 px-1 py-0.5"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={giblets[b.batch] ?? false}
                      onChange={(e) => setGiblets({ ...giblets, [b.batch]: e.target.checked })}
                    />
                    {t('client.chickens.giblets')}
                  </label>
                  <button
                    type="button"
                    onClick={() => reserve(b.batch)}
                    className="rounded bg-leaf-600 px-3 py-1 text-xs font-medium text-white"
                  >
                    {t('client.chickens.reserve')}
                  </button>
                </div>
              ) : (
                mine.map((r) => (
                  <div key={r.id} className="flex items-center justify-between">
                    <span className="text-leaf-700">
                      {t('client.chickens.reserved', { n: r.carcassCount })}
                      {r.wantsGiblets && ` + ${t('client.chickens.giblets')}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => cancel(r.id)}
                      className="rounded px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      {t('client.chickens.cancel')}
                    </button>
                  </div>
                ))
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
