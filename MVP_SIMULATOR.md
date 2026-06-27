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
- [ ] **ETAP 2 — Role & nawigacja:** fake login / przełącznik roli; shell panelu admina + bottom-tab klienta; przełącznik języka.
- [ ] **ETAP 3 — Rdzeń tygodnia:** MVP-3 paczka (create/publish, walidacja sezonu); MVP-4 zamiana z deadlinem + 3 warianty UI.
- [ ] **ETAP 4 — Domknięcie cyklu:** MVP-5 brak odbioru; MVP-7 status+licznik; MVP-13 checkbox odbioru.
- [ ] **ETAP 5 — Eksport XLSX:** MVP-9 SheetJS, 4 arkusze wg spec §19.
- [ ] **ETAP 6 — Deploy dla Magdy:** static export → host na enklava.co; zebranie feedbacku.

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
