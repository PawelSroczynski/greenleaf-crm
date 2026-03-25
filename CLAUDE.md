# CLAUDE.md — GreenLeaf CRM

System RWS (Rolnictwo Wspierane przez Społeczność) dla farmy warzywnej AgroPartyka.
Stack: Next.js 14 App Router, TypeScript strict, Prisma 5, PostgreSQL, Tailwind + shadcn/ui, Vitest.
1 developer (Claude Code) + 1 reviewer (Paweł). MVP deadline: 23 maja 2026.

PRD: `docs/PRD.md`

---

## Hierarchia priorytetów

1. **Maintainability** — kod zrozumiały za 6 miesięcy
2. **Stability** — przewidywalne zachowanie, jawne błędy
3. **Human Ownership** — intencja i kontekst czytelne dla Pawła
4. **Performance** — dopiero gdy powyższe spełnione

**Boring is Beautiful.** Sprawdzone wzorce > sprytne rozwiązania. Jawność > skróty. Stabilność > szybkość pisania.

---

## Struktura katalogów

```
app/                → routing, pages, layouts
  (auth)/           → login, register
  admin/            → panel rolnika (Magda/Filip)
  dashboard/        → panel klienta (paczkowicz)
  actions/          → Server Actions
components/         → shared UI (shadcn/ui)
lib/                → logika biznesowa
  services/         → serwisy domenowe
  validators/       → Zod schemas
prisma/             → schema, migrations, seed
tests/              → Vitest unit + integration
  e2e/              → Playwright
```

---

## Next.js 14 App Router Conventions

- **Server Components** — domyślne. Fetchują dane bezpośrednio z Prisma/serwisów. Zero `'use client'` chyba że interakcja.
- **Client Components** — tylko gdy `useState`, `useEffect`, `onClick` itp. Oznaczaj `'use client'` na górze pliku.
- **Server Actions** — w `app/actions/*.ts` z `'use server'`. Każda akcja zwraca `ActionResult<T>`.
- **Layouts** — współdzielony UI (nawigacja, auth check). Nie fetchują danych specyficznych dla strony.
- **Pages** — fetchują dane i przekazują do komponentów.
- **Loading/Error** — `loading.tsx` i `error.tsx` obok każdej strony z sensownym UI.
- **revalidatePath** — po każdej mutacji (Server Action). Nie używaj `router.refresh()`.

---

## Data Flow Pattern (kanoniczny)

```
Form (Client Component) → Server Action → Zod validation → Service (lib/) → Prisma → revalidatePath
```

Przykład — zamiana warzywa w paczce:
- `components/SwapVegetableForm.tsx` (`'use client'`) — formularz
- `app/actions/subscription.ts` (`'use server'`) — walidacja Zod + wywołanie serwisu
- `lib/services/subscription.ts` — logika biznesowa (sprawdź deadline środa 18:00, dostępność)
- `prisma` — zapis do DB
- `revalidatePath('/dashboard')` — odśwież widok klienta

---

## TDD Workflow

**Red → Green → Refactor** — w tej kolejności, zawsze. Najpierw test, potem implementacja.

Testy pisz językiem biznesowym:
```typescript
it('odmawia zamiany warzywa po środzie 18:00', async () => {
  vi.setSystemTime(new Date('2026-06-03T18:01:00')); // środa 18:01
  const result = await swapVegetable({ subscriptionId: 1, from: 'burak', to: 'marchew' });
  expect(result.success).toBe(false);
  expect(result.error).toContain('deadline');
});
```

**Testowanie Server Actions:** importuj funkcję, wywołaj z danymi, sprawdź wynik.
**Testowanie z Prisma:** osobna test DB (`DATABASE_URL_TEST`), reset przed każdym suite.
**Vitest:** `describe/it`, `vi.setSystemTime()` do mockowania czasu, `beforeEach` do cleanup.

---

## Prisma Conventions

- **Schema = source of truth** dla typów. Nie twórz ręcznych interfejsów dla modeli DB.
- **Prisma Client** — jedyny punkt dostępu do DB. Zero raw SQL.
- Naming: modele `PascalCase`, pola `camelCase`.
- Relacje: zawsze definiuj obie strony.
- **`select` > `include`** — pobieraj tylko potrzebne pola.
- Migracje: `prisma migrate dev` (development), `prisma migrate deploy` (production).
- Seed: `prisma/seed.ts` z realistycznymi danymi (prawdziwe warzywa, prawdziwe daty sezonu).

---

## Zod — jedyne narzędzie walidacji

- Każdy Server Action waliduje input przez Zod schema.
- Schema obok akcji: `lib/validators/subscription.ts`.
- Reużywaj typy: `type CreateSubscription = z.infer<typeof createSubscriptionSchema>`.
- **Nigdy** nie waliduj ręcznie (if/else) — zawsze `schema.parse()` lub `schema.safeParse()`.

---

## Error Handling

```typescript
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };
```

- **Nigdy throw z Server Action** — zawsze zwracaj `ActionResult<T>`.
- Loguj błędy z kontekstem: `console.error('[swapVegetable]', { userId, input, error })`. Bez haseł.
- W dev: włącz Prisma query logging (`prisma.$on('query')`).
- W prod: loguj tylko błędy.

---

## Anti-patterns (Auto-Fail)

1. **Data fetching w Client Components** (`'use client'`). Server Components POWINNY fetchować dane bezpośrednio. Złożona logika biznesowa → `lib/services/`.
2. **Complex business rules w Client Components.** Server Components mogą zawierać prostą logikę renderowania. Wielokrokowa logika (deadliny, kalkulacje, walidacja) → `lib/services/`.
3. **Magic numbers.** Deadline środa 18:00 → `lib/config.ts`, nie `if (day === 3 && hour >= 18)`.
4. **Silent failures.** Pusty catch block = auto-fail. Każdy błąd: loguj lub zwróć `ActionResult`.
5. **God Objects.** Nie: `Utils.ts`, `Helpers.ts`. Tak: `subscriptionService.ts`, `deliveryCalculator.ts`.
6. **Implicit dependencies.** Wszystkie zależności jawnie przez parametry funkcji lub props.
7. **Untested business logic.** Każda reguła biznesowa (deadline zamiany, kalkulacja raty, dostępność) musi mieć test.
8. **Mixing abstraction levels.** Funkcja albo orkiestruje, albo implementuje — nie oba naraz.
9. **Unclear data flow.** Mutacje jawne, czyste funkcje gdzie możliwe, side effects udokumentowane.
10. **Copy-paste.** Duplikacja logiki → wydziel do `lib/`.

---

## Decision Framework

Przy każdym wyborze:
- **Clarity** over cleverness
- **Explicitness** over brevity
- **Stability** over performance
- **Maintainability** over speed of development
- **Boring patterns** over innovative approaches

Wyjątki: udokumentuj DLACZEGO odchodzisz od reguły. Git blame = historia decyzji.

---

## Code Review Checklist

- [ ] Server/Client boundary poprawna? (`'use client'` tylko gdy interakcja)
- [ ] Data flow: Form → Action → Zod → Service → Prisma → revalidatePath?
- [ ] Typy jawne, zero `any`?
- [ ] Zod schema waliduje input w Server Action?
- [ ] `ActionResult<T>` zwracany (nie throw)?
- [ ] Business logic w `lib/services/`, nie w komponencie?
- [ ] Testy dla logiki biznesowej?
- [ ] Nazwy opisowe i jednoznaczne?
- [ ] Brak hardcoded wartości (daty, ceny, deadliny → config)?
- [ ] `select` zamiast `include` w Prisma queries?
- [ ] Brak wrażliwych danych w logach?

---

## Komentarze: Why, Not What

```typescript
// ✅ Deadline środa 18:00 bo rolnik potrzebuje czwartku na kompletowanie paczek
const SWAP_DEADLINE_DAY = 3; // środa
const SWAP_DEADLINE_HOUR = 18;

// ❌ Sprawdzamy czy dzień to 3 i godzina >= 18
```

Typy SĄ dokumentacją. Nie pisz JSDoc który powtarza sygnaturę. Komentuj tylko DLACZEGO.

---

## Komendy

```bash
# Development
npm run dev                    # Next.js dev server
npm run build                  # Production build
npm run lint                   # ESLint

# Testing
npm test                       # Vitest (watch mode)
npm run test:run               # Vitest (single run)
npm run test:e2e               # Playwright

# Database
npx prisma studio              # GUI do przeglądania danych
npx prisma migrate dev         # Nowa migracja (development)
npx prisma migrate deploy      # Aplikuj migracje (production)
npx prisma db seed             # Seed z realistycznymi danymi
npx prisma generate            # Regeneruj klienta po zmianach schema

# Utilities
npx tsc --noEmit               # Type check bez buildu
```
