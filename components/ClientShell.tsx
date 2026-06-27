'use client';

// components/ClientShell.tsx — shell klienta RWS: TopBar + dolny pasek zakładek (mobile-first).

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TopBar } from '@/components/TopBar';
import { SwapPanel } from '@/components/client/SwapPanel';
import { PackageStatus } from '@/components/client/PackageStatus';
import { SubscriptionPanel } from '@/components/client/SubscriptionPanel';
import { ProfilePanel } from '@/components/client/ProfilePanel';

type Tab = 'myPackage' | 'subscription' | 'profile';

const TABS: { tab: Tab; emoji: string }[] = [
  { tab: 'myPackage', emoji: '🧺' },
  { tab: 'subscription', emoji: '📦' },
  { tab: 'profile', emoji: '👤' },
];

export function ClientShell() {
  const { t } = useTranslation();
  const [active, setActive] = useState<Tab>('myPackage');

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1 p-4 pb-24">
        {active === 'myPackage' && (
          <>
            <PackageStatus />
            <SwapPanel />
          </>
        )}
        {active === 'subscription' && <SubscriptionPanel />}
        {active === 'profile' && <ProfilePanel />}
      </main>

      <nav
        aria-label={t('roles.klient_rws')}
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-leaf-100 bg-white"
      >
        {TABS.map(({ tab, emoji }) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            aria-current={active === tab ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
              active === tab ? 'text-leaf-600' : 'text-gray-500'
            }`}
          >
            <span className="text-lg" aria-hidden="true">
              {emoji}
            </span>
            {t(`client.tabs.${tab}`)}
          </button>
        ))}
      </nav>
    </div>
  );
}
