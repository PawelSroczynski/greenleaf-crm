'use client';

// components/admin/PaymentsPanel.tsx — ewidencja płatności (F8): oznacz „zapłacone" (całość / rata).

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import { paymentPlan, markPaid, unmarkPaid } from '@/lib/payments';
import type { Store } from '@/lib/types';

export function PaymentsPanel() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const subs = useMemo(
    () => (store ? store.subscriptions.filter((s) => s.status !== 'cancelled') : []),
    [store, tick],
  );
  if (!store) return null;

  const userName = (id: string) => {
    const u = store.users.find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : id;
  };

  const toggle = (subId: string, installment: number, paid: boolean) => {
    if (paid) unmarkPaid(store, subId, installment);
    else markPaid(store, subId, installment);
    saveStore(store);
    setTick((n) => n + 1);
  };

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{t('admin.nav.payments')}</h2>
      <ul className="space-y-3">
        {subs.map((sub) => (
          <li key={sub.id} className="rounded-xl border border-leaf-100 bg-white p-3 text-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">{userName(sub.userId)}</span>
              <span className="text-xs text-gray-500">{t(`subscriptionType.${sub.type}`)}</span>
            </div>
            <ul className="space-y-1">
              {paymentPlan(sub).map((line) => (
                <li key={line.installment} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={line.paid}
                    onChange={() => toggle(sub.id, line.installment, line.paid)}
                    aria-label={`${userName(sub.userId)} — ${line.label}`}
                  />
                  <span className="flex-1">
                    {line.label}
                    {line.dueDate && <span className="ml-2 text-xs text-gray-400">{line.dueDate}</span>}
                  </span>
                  <span className="text-gray-600">{line.amount} zł</span>
                  {line.paid && (
                    <span className="rounded bg-leaf-50 px-1.5 py-0.5 text-xs text-leaf-700">
                      {t('admin.payments.paid')}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
