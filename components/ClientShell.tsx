'use client';

// components/ClientShell.tsx — shell klienta RWS: TopBar + dolny pasek zakładek (mobile-first).

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TopBar } from '@/components/TopBar';
import { SwapPanel } from '@/components/client/SwapPanel';

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
        {active === 'myPackage' ? (
          <SwapPanel />
        ) : (
          <>
            <h2 className="mb-2 text-xl font-semibold">{t(`client.tabs.${active}`)}</h2>
            <p className="text-gray-600">{t(`client.placeholders.${active}`)}</p>
            <p className="mt-2 inline-block rounded bg-leaf-50 px-2 py-1 text-xs font-semibold text-leaf-700">
              {t('common.soonEtap', { etap: 4 })}
            </p>
          </>
        )}
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
