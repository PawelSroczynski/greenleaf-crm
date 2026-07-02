'use client';

// components/admin/PointsManager.tsx — pula punktów odbioru na Pulpicie (MVP-6, część).
// Dodawanie, włącz/wyłącz; twarde usunięcie tylko dla punktów bez klientów.

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import {
  addPickupPoint,
  clientsAtPoint,
  pointHasHistory,
  removePickupPoint,
  setPickupPointActive,
} from '@/lib/points';
import type { Store } from '@/lib/types';

export function PointsManager() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [tick, setTick] = useState(0);
  const [name, setName] = useState('');
  const [cost, setCost] = useState(10);
  const [hoursFrom, setHoursFrom] = useState('09:00');
  const [hoursTo, setHoursTo] = useState('11:00');
  const [error, setError] = useState('');

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const points = useMemo(
    () => (store ? [...store.pickupPoints] : []),
    [store, tick],
  );

  if (!store) return null;

  const mutate = (fn: () => void) => {
    setError('');
    try {
      fn();
      saveStore(store);
      setTick((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const onAdd = () =>
    mutate(() => {
      addPickupPoint(store, { name, extraCost: cost, hoursFrom, hoursTo });
      setName('');
    });

  const onRemove = (pointId: string, pointName: string) => {
    if (!window.confirm(t('admin.points.removeConfirm', { name: pointName }))) return;
    mutate(() => removePickupPoint(store, pointId));
  };

  return (
    <section className="mt-6">
      <h3 className="mb-2 text-sm font-semibold text-gray-700">{t('admin.points.title')}</h3>

      <ul className="mb-3 divide-y divide-gray-100 rounded-xl border border-leaf-100 bg-white">
        {points.map((p) => {
          const clients = clientsAtPoint(store, p.id).length;
          return (
            <li key={p.id} className="flex items-center gap-2 p-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${p.isActive ? '' : 'text-gray-400 line-through'}`}>
                  {p.name}
                </p>
                <p className="text-xs text-gray-500">
                  {p.hoursFrom}–{p.hoursTo} · {p.extraCost} zł ·{' '}
                  {t('admin.points.clients', { n: clients })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => mutate(() => setPickupPointActive(store, p.id, !p.isActive))}
                className={`rounded px-2 py-1 text-xs font-semibold ${
                  p.isActive
                    ? 'bg-leaf-50 text-leaf-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {p.isActive ? t('admin.points.active') : t('admin.points.inactive')}
              </button>
              {clients === 0 && !pointHasHistory(store, p.id) && (
                <button
                  type="button"
                  onClick={() => onRemove(p.id, p.name)}
                  aria-label={t('admin.points.remove', { name: p.name })}
                  className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  ✕
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="rounded-xl border border-leaf-100 bg-white p-3">
        <p className="mb-2 text-xs font-semibold text-gray-600">{t('admin.points.addTitle')}</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col text-xs text-gray-600">
            {t('admin.points.name')}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-40 rounded border border-leaf-200 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col text-xs text-gray-600">
            {t('admin.points.cost')}
            <input
              type="number"
              min={0}
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="mt-1 w-20 rounded border border-leaf-200 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col text-xs text-gray-600">
            {t('admin.points.from')}
            <input
              type="time"
              value={hoursFrom}
              onChange={(e) => setHoursFrom(e.target.value)}
              className="mt-1 rounded border border-leaf-200 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col text-xs text-gray-600">
            {t('admin.points.to')}
            <input
              type="time"
              value={hoursTo}
              onChange={(e) => setHoursTo(e.target.value)}
              className="mt-1 rounded border border-leaf-200 px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={onAdd}
            disabled={!name.trim()}
            className="rounded bg-leaf-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {t('admin.points.add')}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </section>
  );
}
