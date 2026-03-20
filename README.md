# 🌿 GreenLeaf CRM — Dokumentacja produkcyjna

> System CRM dla gospodarstwa regeneracyjnego Green Leaf Farm / AgroPartyka
> Model: RWS (Rolnictwo Wspierane przez Społeczność / CSA)
> Prowadzący: Magda i Filip Partyka — Kąkolewice 17a, 64-840 Budzyń

---

## Zawartość katalogu

| Plik | Co zawiera | Dla kogo |
|------|-----------|----------|
| `PRD.md` | Product Requirements Document — kompletna specyfikacja systemu | Magda (odbiór), deweloper (implementacja) |
| `DATA_MODEL.md` | Model danych — encje, pola, typy, relacje | Deweloper (Prisma schema) |
| `CHECKLIST.md` | Checklista produkcyjna — krok po kroku od zera do deploy | Deweloper (plan pracy) |

## Jak czytać dokumenty

1. **Zacznij od PRD.md** — przeczytaj Problem Statement, User Stories i Functional Requirements
2. **Szukaj `[WYMAGA DECYZJI MAGDY]`** — to miejsca gdzie Magda musi podjąć decyzję przed implementacją
3. **DATA_MODEL.md** — źródło prawdy dla schematu bazy danych (Prisma)
4. **CHECKLIST.md** — sekwencyjna lista kroków do odhaczania podczas budowy

## Dokument źródłowy

Specyfikacja v0.4: `/home/noaidi/clawd/greenleaf-crm-spec-v0.4.md` (835 linii, 25 pytań od Magdy)

## Stack technologiczny

- **Frontend/Backend:** Next.js (React, SSR)
- **Baza danych:** SQLite
- **ORM:** Prisma
- **UI:** Mobile-first PWA
- **Eksport:** XLSX (ExcelJS)

## Status

- Wersja PRD: **v1.0** (2026-03-20)
- Otwarte pytania: 2 (pyt. 5 — zamienniki; pyt. 24 — UI zamian)
- Elementy MVP: 14
- Faza: pre-development

---

## GitHub

- **Nazwa repo:** `greenleaf-crm`
- **Opis repo:** `CRM system for regenerative CSA farm — managing vegetable box subscriptions, egg/chicken orders, delivery logistics and customer communication. Built with Next.js, SQLite, Prisma.`
- **`.gitignore` entries:**

```
# Node
node_modules/
npm-debug.log*

# Next.js
.next/
out/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Prisma
prisma/migrations/migration_lock.toml

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/

# Logs
*.log

# Coverage
coverage/
```
