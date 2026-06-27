'use client';

// components/LanguageSwitcher.tsx — przełącznik PL/EN, zapisuje wybór w localStorage.

import { useTranslation } from 'react-i18next';
import { LANG_KEY } from '@/lib/i18n';

const LANGS = ['pl', 'en'] as const;

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const change = (lng: string) => {
    i18n.changeLanguage(lng);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANG_KEY, lng);
    }
  };

  return (
    <div className="flex gap-1" role="group" aria-label={t('common.language')}>
      {LANGS.map((lng) => {
        const active = i18n.language === lng;
        return (
          <button
            key={lng}
            type="button"
            onClick={() => change(lng)}
            aria-pressed={active}
            className={`rounded px-2 py-1 text-xs font-semibold uppercase ${
              active ? 'bg-leaf-600 text-white' : 'bg-leaf-50 text-leaf-700'
            }`}
          >
            {lng}
          </button>
        );
      })}
    </div>
  );
}
