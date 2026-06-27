'use client';

// components/admin/ClientsList.tsx — moduł „Klienci" (admin). Lista → szczegół → pauza/wznowienie (MVP-12).

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import { listClients, setSubscriptionStatus } from '@/lib/clients';
import type { Store } from '@/lib/types';

export function ClientsList() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const rows = useMemo(() => (store ? listClients(store) : []), [store, tick]);
  const selected = rows.find((r) => r.user.id === selectedId) ?? null;
  const pointName = (id: string | null) =>
    id ? store?.pickupPoints.find((p) => p.id === id)?.name ?? id : '—';

  if (!store) return null;

  const toggle = (subscriptionId: string, current: string) => {
    setSubscriptionStatus(store, subscriptionId, current === 'active' ? 'paused' : 'active');
    saveStore(store);
    setTick((n) => n + 1);
  };

  if (selected) {
    const u = selected.user;
    return (
      <section>
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="mb-3 text-sm text-leaf-700 hover:underline"
        >
          ← {t('common.back')}
        </button>
        <h2 className="text-xl font-semibold">
          {u.firstName} {u.lastName}
        </h2>
        <p className="mb-4 text-sm text-gray-500">{t(`roles.${u.role}`)}</p>

        <div className="space-y-2 rounded-xl border border-leaf-100 bg-white p-4 text-sm">
          <p><span className="text-gray-500">{t('admin.clients.email')}:</span> {u.email}</p>
          <p><span className="text-gray-500">{t('admin.clients.phone')}:</span> {u.phone ?? '—'}</p>
          <p><span className="text-gray-500">{t('admin.clients.point')}:</span> {pointName(u.defaultPickupPointId)}</p>
          <p><span className="text-gray-500">{t('admin.clients.delivery')}:</span> {t(`deliveryOption.${u.deliveryOption}`)}</p>
        </div>

        <h3 className="mb-2 mt-5 text-sm font-semibold text-gray-700">{t('admin.clients.subscriptions')}</h3>
        {selected.subscriptions.length === 0 ? (
          <p className="text-sm text-gray-500">{t('admin.clients.noSub')}</p>
        ) : (
          <ul className="space-y-2">
            {selected.subscriptions.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-xl border border-leaf-100 bg-white p-3">
                <div className="text-sm">
                  <p className="font-medium text-leaf-700">{t(`subscriptionType.${s.type}`)}</p>
                  <p className="text-gray-500">
                    {s.packagesRemaining}/{s.totalPackages} · {t(`status.${s.status}`)}
                  </p>
                </div>
                {(s.status === 'active' || s.status === 'paused') && (
                  <button
                    type="button"
                    onClick={() => toggle(s.id, s.status)}
                    className="rounded-lg border border-leaf-300 px-3 py-1.5 text-xs font-semibold text-leaf-700 hover:bg-leaf-50"
                  >
                    {s.status === 'active' ? t('admin.clients.pause') : t('admin.clients.resume')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{t('admin.nav.clients')}</h2>
      <ul className="divide-y divide-gray-100 rounded-xl border border-leaf-100 bg-white">
        {rows.map(({ user, subscriptions }) => {
          const pkg = subscriptions.find((s) => s.type === 'paczka_24' || s.type === 'paczka_12');
          return (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => setSelectedId(user.id)}
                className="flex w-full items-center justify-between p-3 text-left hover:bg-leaf-50"
              >
                <span className="text-sm">
                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                  <span className="ml-2 text-xs text-gray-400">{pointName(user.defaultPickupPointId)}</span>
                </span>
                <span className="text-xs text-gray-500">
                  {pkg ? `${pkg.packagesRemaining}/${pkg.totalPackages}` : t('admin.clients.external')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
