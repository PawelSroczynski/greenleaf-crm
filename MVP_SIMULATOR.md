# GreenLeaf CRM — Klikalny MVP (symulator frontend-only)

> **Cel:** klikalna makieta bez backendu do zbierania feedbacku od Magdy (admin gospodarstwa).
> **Po feedbacku:** „podbudowa" — wymiana warstwy danych localStorage → Prisma/SQLite, ten sam Next.js.
> Ten plik jest **kotwicą wznowienia** (power-outage-proof). Stan pracy = sekcja „Postęp" + git log.

## Stack (decyzja 2026-06-27)

- **Next.js (App Router) + TypeScript** — client-only, zero API routes / Prisma / DB w tej fazie
- **Dane:** in-memory store + persystencja `localStorage` (symuluje bazę)
- **i18n:** `react-i18next` — PL 100%, EN szkielet (mechanizm językowy wbudowany)
- **Test (TDD):** Vitest + React Testing Library + happy-dom
- **Styl:** Tailwind, mobile-first PWA
- **Eksport:** SheetJS (xlsx) generowany w przeglądarce

## Źródło prawdy dokumentacyjne

`PRD.md` (§9 = 14 MVP + acceptance criteria) + `DATA_MODEL.md` (16 encji) = **kanon**.
`CHECKLIST.md` i spec v0.2 = kontekst, NIE źródło (przestarzałe: login telefon, deadline 18:00, 12 encji, nazwy PL).

## Decyzje rozstrzygające sprzeczności (GAP MAP defaults)

| # | Sprawa | Wybór do symulatora |
|---|--------|---------------------|
| G1 | Zamienniki | Dowolne z listy tygodniowej (opcja B, rekomendacja PRD) |
| G2 | UI zamian | **Zbudować 3 warianty** (lista+przycisk / formularz X→Y / checkboxy) — to CEL feedbacku |
| G3 | Login | email+hasło; w symulatorze fake login / przełącznik roli |
| G4 | Deadline zamian | **20:00** środa (PRD v1.0) |
| G5 | Encje | 16 wg DATA_MODEL.md (EN, nazwy kanoniczne) |
| G4b | Deadline braku odbioru | 10:00 środa |
| config | Wszystkie deadliny/ceny | w `lib/config.ts` (jedno źródło, anti magic-number) |

## Zakres v1 (7 z 14 MVP — lean)

WCHODZI: MVP-3 (tworzenie/publikacja paczki), MVP-4 (zamiany + 3 warianty UI), MVP-2 (subskrypcje — widok), MVP-7 (status+licznik X/24), MVP-13 (odbiory farma, bez offline), MVP-9 (eksport XLSX — TOP priorytet Magdy), MVP-5 (zgłoszenie braku odbioru).

ODKŁADAMY: MVP-1 auth (fake login), MVP-8 płatności, MVP-6 konfiguracja punktów, MVP-10 ogłoszenia, MVP-11 zamówienia poza abo, MVP-12 edycja subskrypcji, MVP-14 kurczaki. Dokładamy po pozytywnym feedbacku rdzenia.

## Plan etapów (każdy = commit + push + raport)

- [x] **ETAP 0 — Fundament:** scaffold Next.js+TS+Tailwind+Vitest+RTL+i18next; pierwszy zielony test; build zielony. ✅ 2026-06-27
- [x] **ETAP 1 — Domena & dane:** typy TS (16 encji), seed (4 punkty, produkty z sezonowością, userzy testowi), persystencja localStorage. ✅ 2026-06-27 — 21/21 testów, tsc czysty.
- [x] **ETAP 2 — Role & nawigacja:** fake login / przełącznik roli; shell panelu admina + bottom-tab klienta; przełącznik języka. ✅ 2026-06-27 — 31/31 testów, headless mobil OK.
- [x] **ETAP 3 — Rdzeń tygodnia:**
  - [x] **3a** MVP-3 paczka (create/publish, walidacja sezonu, generowanie ClientPackage). ✅ 2026-06-27 — 45/45 testów, headless OK.
  - [x] **3b** MVP-4 zamiana z deadlinem + 3 warianty UI (A/B/C) + symulacja czasu + podsumowanie zamian admina. ✅ 2026-06-27 — 58/58 testów, headless 3 wariantów OK.
- [x] **ETAP 4 — Domknięcie cyklu:** MVP-5 brak odbioru; MVP-7 status+licznik; MVP-13 checkbox odbioru. ✅ 2026-06-27 — 70/70 testów, headless OK.
- [x] **ETAP 5 — Eksport XLSX:** MVP-9 SheetJS, 4 arkusze (Zbiory/Pakowanie/Zmiany/Kurczaki). ✅ 2026-06-27 — 74/74 testów, pobranie pliku zweryfikowane headless.
- [x] **ETAP 6 — Deploy dla Magdy:** static export → https://enklava.co/files/glcrm/ (deploy ciągły po każdym etapie). ✅ Gotowe do feedbacku.
- [x] **ETAP 7 — Klikalne wypełnienie:** Klienci (admin: lista→szczegół→pauza/wznowienie subskrypcji, MVP-12) + Profil (klient: edycja punktu odbioru/dostawy/notatek). ✅ 2026-06-27 — 81/81 testów. Admin i Klient RWS bez martwych zakładek (Dostawca/Klient zewn. poza zakresem decyzją Pawła).

## Zasady pracy

- Każdy krok: **Red → Green → (Refactor)**. Test PRZED implementacją.
- Jeden krok ≈ jeden commit; commit autorstwa użytkownika (bez atrybucji Claude).
- Po każdym etapie: `git push` (trwałość) + raport do Pawła.
- Branch: `feat/mvp-simulator`.

## Hosting (link na żywo, nadpisywany po każdym etapie)

- **Live:** https://enklava.co/files/glcrm/
- Deploy: `bash scripts/deploy-sim.sh` (build z `NEXT_PUBLIC_BASE_PATH=/files/glcrm` → kopia do `/var/www/enklava/files/glcrm/`, noaidi-writable, bez `basic`).

## Postęp (aktualizowany na bieżąco)

- 2026-06-27: audyt mapy przygotowania ukończony; plan zatwierdzony (defaulty); start ETAP 0.
- 2026-06-27: ETAP 0 ZIELONY — Next.js 15.5 + TS + Tailwind + Vitest + RTL + happy-dom; smoke test 2/2; `next build` + static export OK. Następny: ETAP 1 (domena + seed + localStorage).
- 2026-06-27: ETAP 1 ZIELONY — 16 typów, config (deadliny/ceny), seed (56 produktów / 30 dostępnych w czerwcu, 7 userów, 6 subskrypcji, 1 WeeklyPackage + 4 ClientPackage), store localStorage. 21/21 testów, tsc czysty. Deploy pipeline + favicon. Live: enklava.co/files/glcrm/. Następny: ETAP 2 (role + nawigacja + i18n switch).
- 2026-06-27: ETAP 2 ZIELONY — i18n PL/EN (react-i18next, parzystość kluczy), RolePicker (4 role + persystencja), AdminShell/ClientShell/SimpleShell, dowód danych (Aktywnych klientów: 5). 31/31 testów, tsc czysty, headless mobil bez błędów JS. Następny: ETAP 3 (rdzeń: paczka + zamiany 3 warianty UI).
- 2026-06-27: ETAP 3a ZIELONY — moduł „Paczka tygodnia" (lib/packages.ts czyste funkcje + PackageBuilder): walidacja sezonu (pomidor odrzucony w czerwcu), publikacja generuje 4 ClientPackage z 4 aktywnych subskrypcji. 45/45 testów, tsc czysty, headless live OK. Następny: ETAP 3b (zamiany + 3 warianty UI).
- 2026-06-27: ETAP 3b ZIELONY — moduł ZAMIAN (lib/swaps.ts + SwapPanel): 3 warianty UI (A lista+przycisk / B formularz X→Y / C checkboxy), deadline śr 20:00 z symulacją „przed/po terminie", podsumowanie zamian dla admina. 58/58 testów, tsc czysty, headless 3 wariantów + blokada po terminie OK, zero błędów JS. RDZEŃ TYGODNIA KOMPLETNY. Następny: ETAP 4 (brak odbioru + status/licznik + checkbox odbioru).
- 2026-06-27: ETAP 4 ZIELONY — domknięcie cyklu (lib/pickups.ts + PackageStatus/SubscriptionPanel/PickupList): MVP-5 zgłoszenie braku (deadline śr 10:00, cofanie, symulacja czasu), MVP-7 status paczki + licznik X/24, MVP-13 checkbox odbioru (idempotentny, zmniejsza licznik) + flaga „nie zgłosił". 70/70 testów, tsc czysty, headless OK. UWAGA: zrobione w main loop (agent zablokowany bramką Telegram). Następny: ETAP 5 (eksport XLSX — TOP priorytet Magdy).
- 2026-06-27: ETAP 5 ZIELONY — eksport XLSX (lib/export.ts + ExportPanel, SheetJS): 4 arkusze Zbiory/Pakowanie/Zmiany/Kurczaki, czyste funkcje agregujące (po zamianach). 74/74 testów, tsc czysty. Headless: pobrano greenleaf-tydzien-4.xlsx (21KB, 4 arkusze poprawne, Zbiory 11 wierszy, Pakowanie 4). **LEAN-MVP (7/14) KOMPLETNY — symulator gotowy do feedbacku Magdy.**
- 2026-07-02: SKAN CODEBASE + 6 napraw (4 atomic commity na main): (1) KRYTYCZNY — singleton store: komponenty trzymały osobne kopie, saveStore przestarzałej kopii cofał wcześniejsze zapisy (zamiana kasowała „Nie odbiorę"); (2) publishPackage: guard ponownej publikacji (duplikaty ClientPackages) + pustej paczki; (3) createDraftPackage: realne deadliny zamiast pustych stringów + wspólny lib/deadlines.ts; (4) walidacja ilości NaN/≤0; (5) osierocone klucze i18n usunięte; (6) czystka seed. 88/88 testów, regresja live buga #1 potwierdzona headless.

## RUNDA 2 — wdrożenie feedbacku Magdy (2026-07-02)

Decyzje: pełny przemiat wszystkich 18 uwag; zamienniki admin-definiowane + tryb „do wyboru"; logowanie = lekka symulacja + nota backend.

- [x] F1 ✅ — Wariant A jako jedyny (B/C usunięte); deadline braku odbioru śr 20:00; Odbiory alfabetycznie; Profil: godziny+adres punktu
- [x] F2 ✅ — Zamienniki definiowane przez admina (per pozycja) + „warzywa do wyboru" (Cukinia LUB Patison)
- [x] F3 ✅ — Jajka jako osobny podpunkt; osobne odhaczenie paczka/jajka w Odbiorach
- [ ] F4 — Kalendarz odbiorów (harmonogram, co-2-tyg) + prośba o zmianę daty → skrzynka admina
- [ ] F5 — XLSX: nr paczki+data, podział per punkt + suma ogólna, 100g→kg; Pakowanie per punkt; Zmiany +punkt
- [ ] F6 — Ręczne przełączanie statusu paczki przez admina (skompletowana/gotowa)
- [ ] F7 — Pulpit: historia paczek + skład
- [ ] F8 — Płatności: oznacz „zapłacone" (całość/rata)
- [ ] F9 — Kurczaki: partie + zapisy
- [ ] F10 — Zamówienia dodatkowe: admin dodaje produkty, klient zamawia
- [ ] F11 — Komunikacja: klient → wiadomość do Magdy (skrzynka admina, wspólna z F4)
- [ ] F12 — Logowanie (symulacja): admin tworzy konta login+hasło; ekran logowania; nota backend
