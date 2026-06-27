'use client';

// components/RolePicker.tsx — ekran startowy „Wybierz rolę" z 4 kafelkami.

import { useTranslation } from 'react-i18next';
import { useRole, type Role } from '@/lib/role-context';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const ROLE_TILES: { role: Exclude<Role, null>; emoji: string }[] = [
  { role: 'admin', emoji: '👩‍🌾' },
  { role: 'klient_rws', emoji: '🧺' },
  { role: 'klient_zewnetrzny', emoji: '🛒' },
  { role: 'dostawca', emoji: '🚚' },
];

export function RolePicker() {
  const { t } = useTranslation();
  const { setRole } = useRole();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-leaf-600">{t('brand')}</h1>
        <LanguageSwitcher />
      </div>

      <h2 className="text-xl font-semibold">{t('roles.title')}</h2>
      <p className="mt-1 text-sm text-gray-600">{t('roles.subtitle')}</p>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {ROLE_TILES.map(({ role, emoji }) => (
          <button
            key={role}
            type="button"
            onClick={() => setRole(role)}
            className="flex items-start gap-3 rounded-xl border border-leaf-100 bg-white p-4 text-left shadow-sm active:bg-leaf-50"
          >
            <span className="text-2xl" aria-hidden="true">
              {emoji}
            </span>
            <span className="flex flex-col">
              <span className="font-semibold text-leaf-700">{t(`roles.${role}`)}</span>
              <span className="text-sm text-gray-600">{t(`roles.${role}Desc`)}</span>
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
