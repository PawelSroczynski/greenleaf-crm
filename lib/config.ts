// lib/config.ts — jedyne źródło stałych (anti magic-number).
// Wszystkie wartości domenowe pochodzą z DATA_MODEL.md oraz PRD.md (§8 sezon, §4.4 płatności, §4.5 odbiór).

/** Rok sezonu — MVP obsługuje WYŁĄCZNIE 2026 (PRD §12). */
export const SEASON = 2026;

/** Miesiące dostaw: maj–październik (5–10). Sezon 23.05–31.10.2026. */
export const DELIVERY_MONTHS = [5, 6, 7, 8, 9, 10] as const;
export const SEASON_MONTH_START = 5;
export const SEASON_MONTH_END = 10;

/**
 * Deadline'y tygodniowe wyrażone jako dzień tygodnia + godzina.
 * dayOfWeek: 0 = niedziela ... 3 = środa (konwencja Date.getDay()).
 */
export const SWAP_DEADLINE = { dayOfWeek: 3, hour: 20, minute: 0 } as const; // środa 20:00
export const ABSENCE_DEADLINE = { dayOfWeek: 3, hour: 10, minute: 0 } as const; // środa 10:00

/** Dzień odbioru — soboty (PRD §12). */
export const PICKUP_DAY = 'saturday' as const;

/**
 * Koszt dostawy per paczka (zł). DATA_MODEL.md §12/§13, PRD §4.5.
 * Kąkolewice 0 zł, pozostałe punkty +10 zł, dostawa do domu +20 zł.
 */
export const DELIVERY_COST = {
  pickup_kakolewice: 0,
  inne_punkty: 10,
  home_delivery: 20,
} as const;

/** Ceny bazowe abonamentu (bez dostawy) — DATA_MODEL.md §2 "Logika cenowa". */
export const PACKAGE_PRICE = {
  paczka_24: 2160,
  paczka_12: 1080,
} as const;

/** Liczba paczek w sezonie wg typu abonamentu. */
export const PACKAGE_COUNT = {
  paczka_24: 24,
  paczka_12: 12,
} as const;

/** Docelowa liczba pozycji w paczce tygodnia (PRD §9 — 10–12 warzyw). */
export const PACKAGE_ITEM_TARGET = { min: 10, max: 12 } as const;

/** Kurczaki — DATA_MODEL.md §8 (ChickenReservation). */
export const CHICKEN = {
  pricePerKg: 38,
  avgCarcassWeight: 2.8,
} as const;

/** Raty: 10 maja / 10 lipca / 10 września (PRD §4.4, §12). */
export const INSTALLMENT_DATES = [
  `${SEASON}-05-10`,
  `${SEASON}-07-10`,
  `${SEASON}-09-10`,
] as const;
