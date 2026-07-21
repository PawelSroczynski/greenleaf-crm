'use client';

// components/admin/InboxPanel.tsx — skrzynka admina: prośby o zmianę daty + wiadomości klientów (F4/F11).

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import { inbox, markRequestRead } from '@/lib/inbox';
import type { Store } from '@/lib/types';

export function InboxPanel() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const items = useMemo(() => (store ? inbox(store) : []), [store, tick]);
  if (!store) return null;

  const userName = (id: string) => {
    const u = store.users.find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : id;
  };

  const onRead = (id: string) => {
    markRequestRead(store, id);
    saveStore(store);
    setTick((n) => n + 1);
  };

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{t('admin.nav.inbox')}</h2>
      {items.length === 0 ? (
        <p className="text-gray-600">{t('admin.inbox.empty')}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <li
              key={r.id}
              className={`rounded-xl border p-3 text-sm ${
                r.isRead ? 'border-gray-100 bg-white' : 'border-leaf-200 bg-leaf-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{userName(r.userId)}</span>
                <span className="text-xs text-gray-500">
                  {r.kind === 'date_change'
                    ? t('admin.inbox.dateChange')
                    : t('admin.inbox.message')}
                </span>
              </div>
              {r.kind === 'date_change' ? (
                <p className="mt-1 text-gray-700">
                  {t('admin.inbox.dateChangeBody', { from: r.fromDate, to: r.toDate })}
                </p>
              ) : (
                <p className="mt-1 text-gray-700">„{r.body}"</p>
              )}
              {!r.isRead && (
                <button
                  type="button"
                  onClick={() => onRead(r.id)}
                  className="mt-2 rounded border border-leaf-300 px-2 py-0.5 text-xs font-medium text-leaf-700"
                >
                  {t('admin.inbox.markRead')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
