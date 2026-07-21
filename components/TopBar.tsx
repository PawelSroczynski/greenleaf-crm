'use client';

// components/TopBar.tsx — wspólny górny pasek: logo + LanguageSwitcher + „Zmień rolę".

import { useTranslation } from 'react-i18next';
import { useRole } from '@/lib/role-context';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { resetStore } from '@/lib/store';
import { setLoggedInUser } from '@/lib/auth';

export function TopBar() {
  const { t } = useTranslation();
  const { setRole } = useRole();

  const onReset = () => {
    if (typeof window !== 'undefined' && !window.confirm(t('common.resetConfirm'))) return;
    resetStore();
    if (typeof window !== 'undefined') window.location.reload();
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-leaf-100 bg-white px-4 py-3">
      <h1 className="text-lg font-bold text-leaf-600">{t('brand')}</h1>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          title={t('common.reset')}
          aria-label={t('common.reset')}
          className="text-xs text-gray-300 transition-colors hover:text-gray-500"
        >
          ⟳
        </button>
        <LanguageSwitcher />
        <button
          type="button"
          onClick={() => {
            setLoggedInUser(null);
            setRole(null);
          }}
          className="rounded bg-leaf-50 px-2 py-1 text-xs font-semibold text-leaf-700"
        >
          {t('common.changeRole')}
        </button>
      </div>
    </header>
  );
}
