'use client';

// components/client/SubscriptionPanel.tsx — abonament + licznik X/24 + harmonogram odbiorów (F4).

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import { findCurrentClient } from '@/lib/pickups';
import { scheduleFor } from '@/lib/schedule';
import { requestDateChange } from '@/lib/inbox';
import type { Store, Subscription, User } from '@/lib/types';

export function SubscriptionPanel() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [reqFor, setReqFor] = useState<string | null>(null); // data, dla której prosimy o zmianę
  const [newDate, setNewDate] = useState('');
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    const s = loadStore();
    const cur = findCurrentClient(s);
    setStore(s);
    if (cur?.subscription) setSub(cur.subscription);
    if (cur?.user) setUser(cur.user);
  }, []);

  const schedule = useMemo(() => (sub ? scheduleFor(sub) : []), [sub]);

  if (!sub) {
    return <p className="text-gray-600">{t('client.subscription.none')}</p>;
  }

  const delivered = sub.totalPackages - sub.packagesRemaining;

  const submitRequest = (fromDate: string) => {
    if (!newDate || !store || !user) return;
    requestDateChange(store, user.id, fromDate, newDate);
    saveStore(store);
    setSent(fromDate);
    setReqFor(null);
    setNewDate('');
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{t('client.tabs.subscription')}</h2>

      <div className="rounded-xl border border-leaf-100 bg-white p-4">
        <p className="text-sm text-gray-600">{t('client.subscription.type')}</p>
        <p className="text-lg font-semibold text-leaf-700">{t(`subscriptionType.${sub.type}`)}</p>
        <p className="mt-1 text-xs text-gray-500">{t(`frequency.${sub.frequency}`)}</p>
      </div>

      <div className="rounded-xl border border-leaf-100 bg-white p-4">
        <p className="text-sm text-gray-600">{t('client.subscription.counter')}</p>
        <p className="text-3xl font-bold text-leaf-600">
          {delivered}/{sub.totalPackages}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-leaf-500"
            style={{ width: `${(delivered / sub.totalPackages) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {t('client.subscription.remaining', { n: sub.packagesRemaining })}
        </p>
      </div>

      {/* Harmonogram odbiorów (uwaga Magdy — ważne dla paczek co 2 tyg.) */}
      <div className="rounded-xl border border-leaf-100 bg-white p-4">
        <p className="mb-2 text-sm font-semibold text-gray-700">{t('client.schedule.title')}</p>
        <ul className="space-y-1 text-sm">
          {schedule.slice(0, 8).map((e) => (
            <li key={e.date} className="flex items-center justify-between">
              <span
                className={
                  e.delivered
                    ? 'text-gray-400 line-through'
                    : e.isNext
                      ? 'font-semibold text-leaf-700'
                      : 'text-gray-700'
                }
              >
                {e.date}
                {e.isNext && <span className="ml-2 text-xs">← {t('client.schedule.next')}</span>}
              </span>
              {!e.delivered &&
                (reqFor === e.date ? (
                  <span className="flex items-center gap-1">
                    <input
                      type="date"
                      value={newDate}
                      onChange={(ev) => setNewDate(ev.target.value)}
                      aria-label={t('client.schedule.newDate')}
                      className="rounded border border-gray-300 px-1 py-0.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => submitRequest(e.date)}
                      className="rounded bg-leaf-600 px-2 py-0.5 text-xs font-medium text-white"
                    >
                      {t('client.schedule.send')}
                    </button>
                  </span>
                ) : sent === e.date ? (
                  <span className="text-xs text-leaf-700">{t('client.schedule.requested')}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReqFor(e.date)}
                    className="rounded px-2 py-0.5 text-xs font-medium text-leaf-700 hover:bg-leaf-50"
                  >
                    {t('client.schedule.change')}
                  </button>
                ))}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-gray-400">{t('client.schedule.note')}</p>
      </div>

      <div className="rounded-xl border border-leaf-100 bg-white p-4">
        <p className="text-sm text-gray-600">{t('client.subscription.payment')}</p>
        <p className="font-medium text-gray-700">{t(`paymentModel.${sub.paymentModel}`)}</p>
      </div>
    </section>
  );
}
