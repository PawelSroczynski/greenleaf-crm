'use client';

// components/I18nProvider.tsx — owija aplikację w i18n i odczytuje zapisany język.

import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { LANG_KEY } from '@/lib/i18n';

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(LANG_KEY) : null;
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
