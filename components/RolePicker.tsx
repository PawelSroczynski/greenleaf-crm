'use client';

// components/RolePicker.tsx — ekran startowy „Wybierz rolę" z 4 kafelkami.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRole, type Role } from '@/lib/role-context';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { loadStore } from '@/lib/store';
import { authenticate } from '@/lib/auth';

const ROLE_TILES: { role: Exclude<Role, null>; emoji: string }[] = [
  { role: 'admin', emoji: '👩‍🌾' },
  { role: 'klient_rws', emoji: '🧺' },
  { role: 'klient_zewnetrzny', emoji: '🛒' },
  { role: 'dostawca', emoji: '🚚' },
];

export function RolePicker() {
  const { t } = useTranslation();
  const { setRole } = useRole();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const doLogin = () => {
    const u = authenticate(loadStore(), login, password);
    if (!u) {
      setError(t('login.error'));
      return;
    }
    setRole(u.role === 'admin' ? 'admin' : (u.role as Role));
  };

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

      {/* Logowanie klienta (symulacja — admin nadaje login+hasło) */}
      <div className="mt-6 rounded-xl border border-leaf-100 bg-white p-4">
        <p className="mb-2 text-sm font-semibold text-gray-700">{t('login.title')}</p>
        <div className="flex flex-col gap-2">
          <input
            value={login}
            onChange={(e) => { setLogin(e.target.value); setError(''); }}
            aria-label={t('login.login')}
            placeholder={t('login.login')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            aria-label={t('login.password')}
            placeholder={t('login.password')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={doLogin}
            className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {t('login.submit')}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-gray-400">{t('login.note')}</p>
        </div>
      </div>
    </main>
  );
}
