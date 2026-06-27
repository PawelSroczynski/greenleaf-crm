// lib/i18n.ts — inicjalizacja i18next (react-i18next), synchroniczna (bez Suspense).
// Domyślny język 'pl', fallback 'pl'. Zasoby ładowane statycznie z locales/.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pl from '@/locales/pl.json';
import en from '@/locales/en.json';

/** Klucz localStorage przechowujący wybrany język. */
export const LANG_KEY = 'glcrm_lang';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      pl: { translation: pl },
      en: { translation: en },
    },
    lng: 'pl',
    fallbackLng: 'pl',
    supportedLngs: ['pl', 'en'],
    interpolation: { escapeValue: false },
    // Synchroniczna inicjalizacja + brak Suspense — testy i SSG nie migają na ładowaniu.
    initImmediate: false,
    react: { useSuspense: false },
  });
}

export default i18n;
