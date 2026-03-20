# 🌿 GreenLeaf CRM — Checklista produkcyjna

> Sekwencyjna lista kroków od zera do deploy
> Każdy checkbox = jedno zadanie do odhaczenia
> Zależności: wykonuj od góry do dołu (każda sekcja zależy od poprzedniej)

---

## 1. Setup projektu

- [ ] Utworzyć repo `greenleaf-crm` na GitHub
- [ ] `npx create-next-app@latest greenleaf-crm --typescript --tailwind --app --src-dir`
- [ ] Zainstalować zależności: `prisma`, `@prisma/client`, `bcryptjs`, `exceljs`, `zod`, `next-auth` lub custom auth
- [ ] Zainstalować UI: `tailwindcss`, `shadcn/ui` (lub radix)
- [ ] Skonfigurować ESLint + Prettier
- [ ] Utworzyć `.env.local` z DATABASE_URL, SMTP credentials, APP_URL
- [ ] Dodać `.gitignore` (Node + Next.js + env — patrz README.md)
- [ ] Pierwszy commit + push

## 2. Baza danych (SQLite + Prisma)

- [ ] Zainstalować SQLite lokalnie lub skonfigurować hosted (VPS (plik .db))
- [ ] `npx prisma init` (provider: sqlite) — wygenerować `prisma/schema.prisma`
- [ ] Zdefiniować model User (z rolami: admin, dostawca, klient_rws, klient_zewnetrzny)
- [ ] Zdefiniować model Product (warzywa/zioła z sezonowością)
- [ ] Zdefiniować model PickupPoint + DeliveryZone
- [ ] Zdefiniować model Subscription
- [ ] Zdefiniować model WeeklyPackage + PackageItem
- [ ] Zdefiniować model ClientPackage + Swap
- [ ] Zdefiniować model ChickenReservation
- [ ] Zdefiniować model ExtraOrder + ExtraOrderItem
- [ ] Zdefiniować model Payment
- [ ] Zdefiniować model Announcement + Notification
- [ ] Zdefiniować model AuditLog
- [ ] `npx prisma migrate dev --name init` — pierwsza migracja
- [ ] Seed script: 4 punkty odbioru, strefy dostawy, produkty sezonowe (warzywa maj-październik)
- [ ] Seed script: konto admin (Magda) + konto dostawcy testowe
- [ ] Zweryfikować relacje: `npx prisma studio`

## 3. Autentykacja i autoryzacja

- [ ] Endpoint POST `/api/auth/register` — rejestracja (email + hasło + imię + nazwisko)
- [ ] Walidacja: email format, hasło min 8 znaków, unikalność email
- [ ] Hashowanie hasła bcrypt (cost 12)
- [ ] Checkbox akceptacji regulaminu + polityki prywatności (timestamp)
- [ ] Endpoint POST `/api/auth/login` — logowanie (email + hasło → cookie session)
- [ ] Endpoint POST `/api/auth/logout` — wylogowanie (usunięcie cookie)
- [ ] Endpoint POST `/api/auth/reset-password` — reset hasła (email z linkiem, ważny 24h)
- [ ] Endpoint POST `/api/auth/set-password` — ustawienie nowego hasła (z tokenu)
- [ ] Middleware: sprawdzanie sesji + roli na chronionych routes
- [ ] Rate limiting na login: max 5 prób / 15 min per IP
- [ ] Strona `/login` — formularz logowania
- [ ] Strona `/register` — formularz rejestracji (publiczny)
- [ ] Strona `/reset-password` — formularz resetu hasła
- [ ] Redirect po logowaniu wg roli: admin → `/admin`, dostawca → `/driver`, klient → `/dashboard`

## 4. MVP-1: Zarządzanie użytkownikami (admin)

- [ ] Strona `/admin/clients` — lista klientów (tabela z filtrem: rola, aktywny, szukaj)
- [ ] Endpoint GET `/api/users` — lista klientów (admin only)
- [ ] Endpoint POST `/api/users` — admin tworzy konto klienta (generuje temp hasło, wysyła email)
- [ ] Endpoint PATCH `/api/users/:id` — edycja klienta (admin)
- [ ] Endpoint DELETE `/api/users/:id` — dezaktywacja/usunięcie konta (admin)
- [ ] Klient: strona `/profile` — podgląd i edycja swoich danych
- [ ] Klient: przycisk "Usuń konto" (RODO)

## 5. MVP-2: Subskrypcje

- [ ] Strona `/admin/subscriptions` — lista subskrypcji z filtrami
- [ ] Endpoint POST `/api/subscriptions` — admin tworzy subskrypcję dla klienta
- [ ] Formularz: typ (paczka_24/12, jajka A-G), punkt odbioru, model płatności
- [ ] Automatyczne naliczanie kosztu dostawy (0/10/20 zł × liczba paczek)
- [ ] Automatyczne tworzenie rekordów Payment (raty: 10.05/10.07/10.09 lub z góry)
- [ ] Endpoint PATCH `/api/subscriptions/:id` — edycja subskrypcji (admin): zmiana typu, pauza, wznowienie
- [ ] Log zmiany w AuditLog (kto, kiedy, co zmienił)
- [ ] Klient: strona `/subscription` — podgląd swojego abonamentu (typ, ile zostało, płatności)

## 6. MVP-3: Paczki tygodniowe

- [ ] Strona `/admin/packages/new` — tworzenie paczki: wybór tygodnia + checkboxy z produktami sezonowymi
- [ ] Endpoint POST `/api/packages` — tworzenie WeeklyPackage + PackageItems
- [ ] Filtrowanie produktów wg miesiąca (dostępność sezonowa)
- [ ] Endpoint PATCH `/api/packages/:id/publish` — publikacja paczki (zmiana statusu → published)
- [ ] Po publikacji: auto-tworzenie ClientPackage dla każdego klienta z aktywną subskrypcją paczki
- [ ] Po publikacji: wysyłka email + utworzenie Notification in-app dla klientów
- [ ] Strona `/admin/packages` — lista paczek tygodniowych (draft/published/completed)
- [ ] Klient: strona `/package` — zawartość nadchodzącej paczki (od momentu publikacji)

## 7. MVP-4: Zamiany produktów

- [ ] Klient: na stronie `/package` — przycisk "Zamień" przy każdej pozycji
- [ ] Lista dostępnych zamienników `[WYMAGA DECYZJI MAGDY — pyt. 5]`
- [ ] Endpoint POST `/api/swaps` — klient dokonuje zamiany (walidacja: przed deadline środa 20:00)
- [ ] Endpoint DELETE `/api/swaps/:id` — klient cofa zamianę (przed deadline)
- [ ] Blokada UI po deadline (przycisk nieaktywny + komunikat "Termin zamian minął")
- [ ] Admin: strona `/admin/packages/:id/swaps` — podsumowanie zamian (kto zamienił co na co)
- [ ] Admin: widok zagregowany — ile sztuk każdego warzywa przygotować (po uwzględnieniu zamian)

## 8. MVP-5: Zgłoszenie braku odbioru

- [ ] Klient: na stronie `/package` — przycisk "Nie odbiorę w tym tygodniu"
- [ ] Endpoint POST `/api/pickups/absence` — zgłoszenie braku (walidacja: przed środa 10:00)
- [ ] Blokada po deadline (przycisk nieaktywny + komunikat)
- [ ] Admin: lista zgłoszeń braku na dany tydzień
- [ ] System: flagowanie klientów którzy nie odebrali I nie zgłosili braku

## 9. MVP-6: Punkty odbioru + dostawa

- [ ] Seed: 4 punkty odbioru z adresami, godzinami, kosztami
- [ ] Seed: strefy dostawy (miejscowości + koszt 20 zł)
- [ ] Przy rejestracji: klient wybiera domyślny punkt odbioru LUB dostawę do domu
- [ ] Strona `/profile` — zmiana punktu odbioru
- [ ] Koszty dostawy automatycznie przeliczane w subskrypcji

## 10. MVP-7: Status paczki

- [ ] Klient widzi status: oczekująca → skompletowana → do_odbioru → odebrana
- [ ] Klient widzi licznik: "Paczka 8 z 24"
- [ ] Strona `/history` — historia odebranych paczek (lista z datami)
- [ ] Status aktualizuje się po zaznaczeniu odbioru przez admina/dostawcę

## 11. MVP-8: Ewidencja płatności

- [ ] Strona `/admin/payments` — tabela płatności (filtry: status, klient, typ)
- [ ] Przycisk "Oznacz zapłacone" — 1 klik → modal z wyborem metody (przelew/gotówka/BLIK)
- [ ] Endpoint PATCH `/api/payments/:id` — oznaczenie płatności (admin only)
- [ ] Auto-przypomnienie email: 5 dni przed terminem raty
- [ ] Klient: strona `/payments` — ile wpłacił, ile zostało, następna rata kiedy
- [ ] Model ratalny: kwota dzielona na 3 raty z uwzględnieniem kosztów dostawy

## 12. MVP-9: Eksport XLSX

- [ ] Endpoint GET `/api/export/xlsx?week=N` — generowanie pliku XLSX
- [ ] Arkusz ZBIORY: lista warzyw, ilości do zbioru, waga, paczki per punkt
- [ ] Arkusz PAKOWANIE: lista klientów per lokalizacja (jajka, zmiany, zakupy, odebrane, płatność)
- [ ] Arkusz ZMIANY: szczegóły zamian per klient (zawartość → zamiana, zakupy poza abo)
- [ ] Arkusz KURCZAKI: zamówienia per lokalizacja (tuszki, waga, zapłacono, adres, telefon)
- [ ] Przycisk "Eksportuj" na stronie `/admin/packages/:id` + globalny `/admin/export`
- [ ] Test: plik otwiera się poprawnie w Excel na Windows
- [ ] Weryfikacja zgodności z szablonami Magdy (§19 specyfikacji v0.4)

## 13. MVP-10: Ogłoszenia i powiadomienia

- [ ] Strona `/admin/announcements/new` — tworzenie ogłoszenia (treść, grupa docelowa, kanał)
- [ ] Endpoint POST `/api/announcements` — tworzenie + wysyłka email + in-app notifications
- [ ] Klient: strona `/notifications` — lista powiadomień (sortowane od najnowszych, oznaczanie przeczytanych)
- [ ] Badge z liczbą nieprzeczytanych w nawigacji
- [ ] Auto-powiadomienia (cron/scheduler):
  - [ ] Wtorek: zawartość paczki (po publikacji)
  - [ ] Środa 9:00: deadline zamian
  - [ ] Piątek: przypomnienie o odbiorze
  - [ ] 5 dni przed ratą: przypomnienie o płatności
  - [ ] Kurczaki: partia gotowa

## 14. MVP-11: Zamówienia poza abonamentem

- [ ] Strona `/shop` — lista dostępnych produktów z cenami (publiczna po zalogowaniu)
- [ ] Klient: formularz zamówienia (produkty + ilości)
- [ ] Endpoint POST `/api/orders` — złożenie zamówienia
- [ ] Admin: strona `/admin/orders` — lista zamówień (statusy: submitted/approved/rejected)
- [ ] Przyciski: Zatwierdź / Odrzuć (z polem na komentarz)
- [ ] Powiadomienie do klienta o zmianie statusu (email + in-app)

## 15. MVP-12: Edycja subskrypcji

- [ ] Na stronie `/admin/clients/:id` — sekcja subskrypcji z przyciskiem "Edytuj"
- [ ] Formularz: zmiana typu, pauza/wznowienie, zmiana punktu odbioru
- [ ] Log zmian w AuditLog
- [ ] Klient widzi zaktualizowane dane po zmianie

## 16. MVP-13: Zaznaczanie odbiorów

- [ ] Strona `/admin/pickups/:week` — lista klientów per punkt z checkboxami (widok farmy)
- [ ] Strona `/driver/pickups/:week` — lista klientów per punkt z checkboxami (widok dostawcy)
- [ ] Endpoint PATCH `/api/pickups/:id/confirm` — zaznaczenie odbioru (z parametrem: farm/driver)
- [ ] Zaznaczenia farmy i dostawcy NIEZALEŻNE (osobne pola w ClientPackage)
- [ ] Admin widok: kto potwierdził (farma/dostawca/oba/żaden) — ikony/kolory
- [ ] **Offline (dostawca):**
  - [ ] Service Worker: cache listy odbiorów na dany tydzień
  - [ ] IndexedDB: zapisywanie zaznaczeń offline
  - [ ] Background sync: synchronizacja po powrocie zasięgu
  - [ ] Wizualna informacja: "Offline — dane zsynchronizują się po połączeniu"

## 17. MVP-14: Rezerwacje kurczaków

- [ ] Strona `/chickens` — klient (RWS + zewnętrzny) widzi 3 partie z datami
- [ ] Formularz rezerwacji: partia + liczba tuszek + podroby (TAK/NIE)
- [ ] Klient widzi: cenę/kg (38 zł) + średnią wagę (2,8 kg) — NIE widzi kwoty
- [ ] Endpoint POST `/api/chickens` — rezerwacja
- [ ] Admin: strona `/admin/chickens` — lista rezerwacji per partia
- [ ] Admin: wpisanie wagi rzeczywistej po uboju → system wylicza kwotę
- [ ] Endpoint PATCH `/api/chickens/:id` — aktualizacja wagi/statusu
- [ ] Statusy: zarezerwowany → w_hodowli → gotowy → odebrany
- [ ] Powiadomienie do klienta gdy partia gotowa

## 18. Layout i nawigacja

- [ ] Layout admin: sidebar (desktop) / hamburger (mobile) — Dashboard, Paczki, Klienci, Płatności, Kurczaki, Zamówienia, Ogłoszenia, Eksport
- [ ] Layout klient: bottom tab bar — Paczka, Abonament, Kurczaki, Zamówienia, Profil
- [ ] Layout dostawca: jeden ekran — lista odbiorów z przełącznikiem punktu
- [ ] Responsywność: 360px → 1920px
- [ ] PWA manifest + service worker (installowalna na telefonie)

## 19. Email

- [ ] Skonfigurować dostawcę email (Resend / Mailgun / SMTP)
- [ ] Template: rejestracja (powitanie + link aktywacyjny)
- [ ] Template: reset hasła (link 24h)
- [ ] Template: zawartość paczki (wtorek)
- [ ] Template: deadline zamian (środa 9:00)
- [ ] Template: przypomnienie odbioru (piątek)
- [ ] Template: przypomnienie raty (5 dni przed)
- [ ] Template: kurczaki gotowe
- [ ] Template: status zamówienia (zatwierdzone/odrzucone)
- [ ] Unsubscribe link w każdym emailu (RODO)
- [ ] Scheduler/cron: auto-wysyłka w odpowiednie dni/godziny

## 20. RODO i bezpieczeństwo

- [ ] Strona `/privacy` — polityka prywatności
- [ ] Strona `/terms` — regulamin
- [ ] Checkbox akceptacji przy rejestracji (obowiązkowy)
- [ ] Endpoint: eksport danych klienta (RODO — prawo do przenoszenia)
- [ ] Usunięcie konta: anonimizacja danych po 30 dniach
- [ ] HTTPS (Let's Encrypt)
- [ ] CSRF protection
- [ ] HttpOnly + Secure + SameSite cookies
- [ ] Rate limiting (login, register, reset-password)
- [ ] Logi dostępu (AuditLog) — retencja 90 dni

## 21. Deploy i monitoring

- [ ] Uzgodnić hosting z Mateuszem Glazerem (biuro@x-web.pl, 697-670-761)
- [ ] Skonfigurować domenę/subdomenę (np. crm.agropartyka.com)
- [ ] Deploy: Docker (Dockerfile + docker-compose) lub Vercel/Railway
- [ ] Zmienne środowiskowe na produkcji (.env)
- [ ] SQLite produkcyjny (backup codziennie, retencja 30 dni)
- [ ] `npx prisma migrate deploy` na produkcji
- [ ] Seed danych produkcyjnych (punkty odbioru, produkty sezonowe, konto admina)
- [ ] SSL/HTTPS (Let's Encrypt lub CDN)
- [ ] Health check endpoint: GET `/api/health`
- [ ] Monitoring: alerty email przy downtime
- [ ] Link z agropartyka.com → CRM (uzgodnić z Mateuszem)
- [ ] Testy z Magdą na telefonie (Android/iOS) + laptopie (Windows/Chrome)
- [ ] Testy z dostawcą (offline scenario)

## 22. Dokumentacja

- [ ] README.md w repo (setup, env, development, deploy)
- [ ] Instrukcja dla Magdy (admin): jak tworzyć paczki, oznaczać płatności, eksportować XLSX
- [ ] Instrukcja dla klientów: jak się zarejestrować, zamawiać, zgłaszać brak odbioru

---

**Łączna liczba elementów:** 156 checkboxów
**Estymowany czas:** 8-12 tygodni (1 deweloper full-time)
**Deadline MVP:** przed sezonem — do 15 maja 2026

---

*Checklista v1.0 — Data: 2026-03-20*
