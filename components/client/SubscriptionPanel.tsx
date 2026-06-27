'use client';

// components/client/SubscriptionPanel.tsx — MVP-7: widok abonamentu klienta + licznik X/24.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore } from '@/lib/store';
import { findCurrentClient } from '@/lib/pickups';
import type { Subscription } from '@/lib/types';

export function SubscriptionPanel() {
  const { t } = useTranslation();
  const [sub, setSub] = useState<Subscription | null>(null);

  useEffect(() => {
    const cur = findCurrentClient(loadStore());
    if (cur?.subscription) setSub(cur.subscription);
  }, []);

  if (!sub) {
    return <p className="text-gray-600">{t('client.subscription.none')}</p>;
  }

  const delivered = sub.totalPackages - sub.packagesRemaining;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{t('client.tabs.subscription')}</h2>

      <div className="rounded-xl border border-leaf-100 bg-white p-4">
        <p className="text-sm text-gray-600">{t('client.subscription.type')}</p>
        <p className="text-lg font-semibold text-leaf-700">{t(`subscriptionType.${sub.type}`)}</p>
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

      <div className="rounded-xl border border-leaf-100 bg-white p-4">
        <p className="text-sm text-gray-600">{t('client.subscription.payment')}</p>
        <p className="font-medium text-gray-700">{t(`paymentModel.${sub.paymentModel}`)}</p>
      </div>
    </section>
  );
}
