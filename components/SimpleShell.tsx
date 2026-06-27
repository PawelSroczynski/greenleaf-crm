'use client';

// components/SimpleShell.tsx — prosty placeholder shell dla 'dostawca' i 'klient_zewnetrzny'.

import { useTranslation } from 'react-i18next';
import { TopBar } from '@/components/TopBar';

export function SimpleShell({ variant }: { variant: 'supplier' | 'external' }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="p-4">
        <h2 className="mb-2 text-xl font-semibold">{t(`${variant}.title`)}</h2>
        <p className="text-gray-600">{t(`${variant}.placeholder`)}</p>
        <p className="mt-2 inline-block rounded bg-leaf-50 px-2 py-1 text-xs font-semibold text-leaf-700">
          {t('common.soon')}
        </p>
      </main>
    </div>
  );
}
