# 🌿 GreenLeaf CRM — Product Requirements Document v1.0

> System zarządzania gospodarstwa regeneracyjnego w modelu RWS (CSA)
> Gospodarstwo: Green Leaf Farm / AgroPartyka — Kąkolewice 17a, 64-840 Budzyń
> Prowadzący: Magda i Filip Partyka
> Stack: Next.js + PostgreSQL + Prisma
> Data: 2026-03-20 | Status: PRD produkcyjny

---

## 1. Problem Statement

Magda i Filip prowadzą gospodarstwo regeneracyjne obsługujące 125 rodzin / 80 paczek warzywnych tygodniowo. Obecny workflow:

- **Zamówienia:** Google Forms (jedno pole tekstowe, brak walidacji)
- **Zarządzanie:** ręczny Excel (błędogenny, czasochłonny)
- **Komunikacja:** grupa FB + Messenger + SMS (fragmentacja)
- **Zamiany warzyw:** link do arkusza Google wysyłany co tydzień
- **Płatności:** ręczna ewidencja w zeszycie/Excelu

**Skutki:** Magda spędza 4-6h tygodniowo na administracji zamiast na pracy w polu. Brak jednego źródła prawdy o klientach, płatnościach i odbiorach. Ryzyko błędów przy kompletacji paczek (złe ilości, pominięte zamiany).

**Cel systemu:** Zastąpić Google Forms + Excel jedną aplikacją webową, która:
1. Skróci czas administracji do max 1h tygodniowo
2. Wyeliminuje błędy przy kompletacji (automatyczne podsumowania)
3. Zapewni eksport XLSX zgodny z obecnymi szablonami Magdy
4. Da klientom self-service (zamiany, odbiory, podgląd abonamentu)

**Definicja sukcesu:** System obsługuje pełny sezon 2026 (23.05-31.10, 24 tygodnie) bez powrotu do Google Forms/Excel.

---

## 2. User Personas

### 2.1 👩‍🌾 Magda (Admin / Rolnik)

- **Rola:** Główna administratorka, zarządza klientami, paczkami, płatnościami
- **Urządzenia:** Telefon (80% czasu), laptop Windows (20% — eksporty, przeglądy)
- **Tech-savviness:** Niska — "nie mam pojęcia, totalnie się nie znam"
- **Cele:** Mniej czasu na administrację, pewność że nikt nie jest pominięty, łatwy eksport do Excel
- **Frustracje:** Ręczne przepisywanie danych, brak jednego widoku "kto zapłacił", kopiowanie informacji między narzędziami
- **Typowy dzień:** Rano sprawdza zamówienia, w ciągu dnia pracuje w polu, wieczorem aktualizuje dane

### 2.2 👨‍🌾 Filip (Admin / Rolnik)

- **Rola:** Współadministrator, głównie logistyka i dostawy
- **Urządzenia:** Telefon
- **Cele:** Szybki podgląd co spakować, kto odbiera, listy na sobotę
- **Frustracje:** Szukanie informacji w wielu miejscach

### 2.3 🚗 Dostawca (pracownik w trasie)

- **Rola:** Dowozi paczki do punktów odbioru, zaznacza kto odebrał
- **Urządzenia:** Telefon (WYŁĄCZNIE)
- **Tech-savviness:** Średnia
- **Cele:** Szybko zaznaczyć odbiory na liście, minimum klikania
- **Frustracje:** Brak zasięgu w trasie (offline!), papierowe listy
- **Krytyczne:** Aplikacja MUSI działać przy słabym/zerowym internecie w trasie

### 2.4 🧑‍🤝‍🧑 Klient RWS (abonamentowicz)

- **Rola:** Kupuje abonament na paczki warzywne, jajka, kurczaki
- **Urządzenia:** Telefon (90%), komputer (10%)
- **Tech-savviness:** Zróżnicowana (od 25 do 65 lat)
- **Cele:** Wiedzieć co jest w paczce, zamienić warzywa, sprawdzić ile paczek zostało
- **Frustracje:** Nieczytelne formularze Google, brak powiadomień o terminach

### 2.5 🐔 Klient zewnętrzny

- **Rola:** Kupuje kurczaki lub produkty poza abonamentem (40% zamówień kurczaków)
- **Urządzenia:** Telefon
- **Cele:** Zamówić kurczaki, wiedzieć kiedy odbiór
- **Ograniczenia:** Widzi TYLKO moduł kurczaków + zamówienia poza abonamentem

---

## 3. User Stories

### Admin (Magda / Filip)

1. Jako admin chcę tworzyć tygodniową zawartość paczki z listy sezonowych warzyw, żeby klienci wiedzieli co dostaną.
2. Jako admin chcę opublikować zawartość paczki we wtorek i automatycznie powiadomić klientów (email + in-app), żeby nie robić tego ręcznie na FB.
3. Jako admin chcę widzieć podsumowanie zamian (ile sztuk każdego warzywa przygotować), żeby zaplanować zbiory.
4. Jako admin chcę ręcznie oznaczać płatności jako "zapłacone" (przelew/gotówka/BLIK), żeby mieć ewidencję bez integracji bankowej.
5. Jako admin chcę eksportować dane do XLSX (4 arkusze: Zbiory, Pakowanie, Zmiany, Kurczaki), żeby korzystać z moich istniejących szablonów.
6. Jako admin chcę tworzyć i usuwać konta klientów, żeby zarządzać dostępem do systemu.
7. Jako admin chcę edytować subskrypcje klientów (zmiana opcji, pauza), żeby reagować na prośby telefoniczne.
8. Jako admin chcę zatwierdzać lub odrzucać zamówienia poza abonamentem, żeby kontrolować dostępność produktów.
9. Jako admin chcę zaznaczać odbiory na liście z checkboxami (farma), żeby wiedzieć kto odebrał w Kąkolewicach.
10. Jako admin chcę wpisać wagę rzeczywistą tuszki po uboju, żeby system wyliczył kwotę do zapłaty (waga × 38 zł/kg).
11. Jako admin chcę wysyłać ogłoszenia broadcast (email + in-app) do grup: wszyscy / paczka / jajka / kurczaki, żeby informować klientów o ważnych sprawach.

### Dostawca

12. Jako dostawca chcę widzieć listę klientów do odbioru w danym punkcie (z checkboxami), żeby szybko zaznaczyć kto odebrał.
13. Jako dostawca chcę żeby zaznaczenia odbiorów zapisywały się lokalnie gdy nie mam internetu i synchronizowały po powrocie zasięgu, żeby nic nie zginęło.

### Klient RWS

14. Jako klient chcę zobaczyć zawartość nadchodzącej paczki (od wtorku), żeby wiedzieć co dostaję.
15. Jako klient chcę zamienić warzywa w paczce na inne dostępne (do środy 20:00), żeby dostać to co lubię.
16. Jako klient chcę zgłosić brak odbioru w tym tygodniu (do środy 10:00), żeby zachować prawo do refundacji.
17. Jako klient chcę widzieć ile paczek odebrałem z X (np. 8 z 24), żeby kontrolować swój abonament.
18. Jako klient chcę widzieć status płatności (ile wpłaciłem, ile zostało, kiedy następna rata), żeby nie przegapić terminu.
19. Jako klient chcę zarezerwować kurczaki na konkretną partię (I/II/III) z liczbą tuszek, żeby mieć pewność że dostanę.
20. Jako klient chcę zarejestrować się samodzielnie (email + hasło), żeby nie czekać na Magdę.

### Klient zewnętrzny

21. Jako klient zewnętrzny chcę zarejestrować się przez publiczny link i zamówić kurczaki, żeby kupić tuszki bez abonamentu.
22. Jako klient zewnętrzny chcę złożyć zamówienie poza abonamentem (warzywa, jajka, tuszki) i zobaczyć status zatwierdzenia, żeby wiedzieć czy mogę odebrać.

### System (automatyczne)

23. Jako system chcę automatycznie blokować zamiany po środzie 20:00 i zgłoszenia braku odbioru po środzie 10:00, żeby egzekwować deadliny.
24. Jako system chcę wysyłać auto-przypomnienia: wt (zawartość paczki), śr 9:00 (deadline zamian), pt (odbiór jutro), przed ratą (10 każdego miesiąca), żeby klienci nie zapominali.

---

## 4. Functional Requirements

### 4.1 📦 Moduł Paczek (rdzeń systemu)

**Admin:**
- Tworzenie tygodniowej zawartości paczki (10-12 pozycji z listy sezonowych warzyw)
- Publikacja zawartości (wtorek) → auto-powiadomienie klientów (email + in-app)
- Podgląd zamian (kto zamienił co na co) + podsumowanie ilości do zbioru
- Status kompletacji: niekompletna → skompletowana → do_odbioru → odebrana
- Lista odbioru per punkt odbioru (na ekran i do XLSX)
- Zaznaczanie odbiorów (farma — checkboxy na liście)
- Flagowanie klientów którzy nie zgłosili braku odbioru a nie odebrali
- Edycja harmonogramów odbiorów klientów
- Dopisywanie/usuwanie klientów z systemu

**Klient:**
- Podgląd zawartości nadchodzącej paczki (od wtorku)
- Zamiana produktów — z listy dostępnych zamienników `[WYMAGA DECYZJI MAGDY — pyt. 5: czy zamienniki predefiniowane per warzywo czy dowolne z listy tygodniowej?]`
- Deadline na zamiany: środa 20:00 (system blokuje po terminie)
- Zgłoszenie braku odbioru: deadline środa 10:00
- Historia odebranych paczek + licznik (X z 24 lub 12)
- Widoczny harmonogram odbiorów na cały sezon (readonly)

**UI zamian warzyw:** `[WYMAGA DECYZJI MAGDY — pyt. 24: potrzebny mockup/demo z wariantami do pokazania na telefonie]`

### 4.2 🥚 Moduł Jajek

- Subskrypcja wg opcji A-G (10/20/30 jajek, co tydzień lub co 2 tygodnie, opcja G indywidualna)
- Status: zamówione → gotowe → odebrane
- Przerwa w subskrypcji (zgłoszenie do środy 10:00)
- Licznik wytłaczanek (ile odebrano z puli)

### 4.3 🐔 Moduł Kurczaków

- Rezerwacja na partię (I — 30.05, II — 01.08, III — 10.10) z liczbą tuszek
- Klient widzi: cenę za kg (38 zł) + średnią wagę tuszki (2,8 kg)
- Klient NIE widzi kwoty do zapłaty przed odbiorem
- Admin wpisuje wagę rzeczywistą po uboju → system wylicza kwotę (waga × 38 zł/kg)
- Status: zarezerwowany → w_hodowli → gotowy_do_odbioru → odebrany
- Płatność przy odbiorze (osobna od abonamentu)
- Dostępne dla klientów zewnętrznych (rejestracja przez publiczny link)

### 4.4 💳 Moduł Płatności

- Ewidencja — system NIE obsługuje płatności online w v1
- Magda ręcznie oznacza "zapłacone" (metoda: przelew / gotówka / BLIK)
- Status: zapłacone / niezapłacone / częściowo
- Model ratalny: 3 raty (10 maj / 10 lip / 10 wrz) — auto-przypomnienia email
- Koszty dostawy doliczane z góry do abonamentu (wchodzą w kwotę ratalną)
- Rozliczenie kurczaków osobno (przy odbiorze)
- Podsumowanie klienta: ile wpłacił, ile zostało, następna rata kiedy
- Eksport listy płatności do XLSX

### 4.5 📅 Moduł Odbioru

- Kalendarz sobotnich odbiorów (cały sezon: 23.05-31.10)
- 4 punkty odbioru: Kąkolewice (0 zł), Komorniki (+10 zł), Puszczykowo (+10 zł), Baranowo (+10 zł)
- Dostawa do domu: +20 zł (Komorniki, Puszczykowo, Chodzież, Margonin, Szamocin, Wągrowiec, Piła)
- Klient wybiera domyślny punkt przy rejestracji (zmiana możliwa)
- **Potwierdzenie odbioru — dwa niezależne widoki:**
  - Dostawca: zaznacza odbiory w trasie (telefon, offline-capable)
  - Farma: zaznacza odbiory na gospodarstwie (Magda/Filip)
  - Oba widoki: lista z checkboxami, minimum kliknięć
- Zgłoszenie braku odbioru przez klienta (do środy 10:00)

### 4.6 💬 Moduł Komunikacji

- FB działa równolegle — aplikacja uzupełnia, nie zastępuje
- Ogłoszenia broadcast: zawartość paczki, info sezonowe, wydarzenia
- Grupy docelowe: wszyscy / paczka / jajka / kurczaki
- **Kanały powiadomień:**
  - Email: automatyczne (wt/śr/pt + raty + kurczaki)
  - In-app: powiadomienia w aplikacji
  - SMS: Magda wysyła samodzielnie POZA systemem
- Auto-powiadomienia:
  - Wtorek: "Zawartość paczki na ten tydzień: [lista]"
  - Środa 9:00: "Przypomnienie: deadline na zamiany dziś o 20:00"
  - Piątek: "Jutro odbiór! Punkt [X], godziny [Y]"
  - Przed ratą: "Przypomnienie: rata do 10 [miesiąc]"
  - Kurczaki: "Partia [X] gotowa! Odbiór w sobotę [data]"

### 4.7 📥 Moduł Zamówień Poza Abonamentem

- Klient widzi listę dostępnych produktów z cenami
- Klient składa zamówienie (wybiera produkty + ilości)
- Rolnik zatwierdza lub odrzuca (z komentarzem)
- Klient otrzymuje powiadomienie o statusie
- Dostępne dla abonamentowiczów + klientów zewnętrznych

### 4.8 📊 Eksport XLSX (TOP PRIORYTET)

4 arkusze zgodne z szablonami Magdy:
1. **ZBIORY** — planowanie zbiorów: lista warzyw, ilości do zbioru, waga, podsumowanie paczek per punkt
2. **PAKOWANIE + DOSTAWY** — lista klientów per lokalizacja: nazwisko, jajka, zamiany, zakupy, status odbioru, płatność
3. **ZMIANY + ZAKUPY** — szczegóły zamian per klient: zawartość paczki, zamiana na, zakupy poza abonamentem
4. **KURCZAKI** — lista zamówień per lokalizacja: tuszki, podroby, waga, zapłacono, forma płatności, adres, telefon

Przycisk "Eksportuj" w panelu admina generuje plik XLSX z aktualnymi danymi.

### 4.9 👤 Rejestracja i Autentykacja

- **Logowanie:** email + hasło
- **Rejestracja klienta:** self-service (formularz publiczny) LUB admin tworzy konto za klienta
- Admin tworzy konto → system generuje tymczasowe hasło → klient otrzymuje email z linkiem do ustawienia własnego hasła
- **Reset hasła:** email z linkiem do resetu (ważny 24h)
- **Hasła:** hashowane bcrypt/argon2, min 8 znaków
- **Sesje:** cookie-based, wygasanie po 7 dniach nieaktywności
- **Role:** admin, dostawca, klient_rws, klient_zewnetrzny
- **Dostawca:** osobna rola z dostępem TYLKO do listy odbiorów (oddzielna od admina)
- Klient może usunąć swoje konto (RODO)
- Admin może dezaktywować/usunąć konto klienta

**Matryca uprawnień:**

| Funkcja | Admin | Dostawca | Klient RWS | Klient zewn. |
|---------|-------|----------|------------|-------------|
| Panel admina | ✅ | ❌ | ❌ | ❌ |
| Tworzenie paczek | ✅ | ❌ | ❌ | ❌ |
| Zaznaczanie odbiorów | ✅ (farma) | ✅ (trasa) | ❌ | ❌ |
| Zarządzanie klientami | ✅ | ❌ | ❌ | ❌ |
| Ewidencja płatności | ✅ | ❌ | ❌ | ❌ |
| Eksport XLSX | ✅ | ❌ | ❌ | ❌ |
| Ogłoszenia broadcast | ✅ | ❌ | ❌ | ❌ |
| Podgląd paczki | ✅ | ❌ | ✅ | ❌ |
| Zamiany warzyw | ❌ | ❌ | ✅ | ❌ |
| Zgłoszenie braku odbioru | ❌ | ❌ | ✅ | ❌ |
| Rezerwacja kurczaków | ✅ | ❌ | ✅ | ✅ |
| Zamówienia poza abo | ✅ | ❌ | ✅ | ✅ |
| Podgląd swojego konta | ❌ | ❌ | ✅ | ✅ |

---

## 5. Non-Functional Requirements

### 5.1 Wydajność

- **Czas ładowania strony:** max 3s na LTE (mobile), max 2s na WiFi (desktop)
- **Concurrent users peak:** ~50 (sobota rano — wszyscy klienci sprawdzają odbiory)
- **Baza danych:** 125 klientów, ~3000 paczek/sezon, ~500 rezerwacji kurczaków — mały system, PostgreSQL wystarczy bez optymalizacji
- **XLSX export:** generowanie pliku max 5s dla pełnych danych sezonu

### 5.2 Offline (KRYTYCZNE dla dostawcy)

- **Dostawca w trasie:** lista odbiorów musi ładować się z cache gdy brak internetu
- **Strategia:** Service Worker + IndexedDB — zaznaczenia zapisują się lokalnie, synchronizacja po powrocie zasięgu
- **Konflikt synchronizacji:** local-first (zaznaczenie dostawcy ma priorytet, farma zaznacza niezależnie)
- **Zakres offline:** TYLKO widok listy odbiorów z checkboxami (nie cały system)

### 5.3 Bezpieczeństwo

- HTTPS obowiązkowy (Let's Encrypt)
- Hasła hashowane bcrypt (cost factor 12) lub argon2
- CSRF protection na formularzach
- Rate limiting na logowaniu (max 5 prób / 15 min)
- Sesje z wygasaniem (7 dni nieaktywności)
- Logi dostępu (kto, kiedy, co zmienił — retencja 90 dni)
- Backup bazy danych: codziennie (konfiguracja z Mateuszem Glazerem)
- Eksport wszystkich danych z panelu admina (RODO — prawo do przenoszenia)

### 5.4 Kompatybilność

- **Mobile:** Chrome Android 90+, Safari iOS 15+ (PWA)
- **Desktop:** Chrome 100+, Edge 100+, Firefox 100+
- **Rozdzielczość:** 360px (mobile) — 1920px (desktop)
- **PWA:** instalowalna na ekranie głównym telefonu (manifest + service worker)
- **System operacyjny admina:** Windows 10+ (laptop Magdy)

### 5.5 Dostępność i niezawodność

- **Uptime:** 99% (max ~7h downtime/miesiąc — akceptowalne dla skali 125 klientów)
- **Backup:** codziennie, retencja 30 dni
- **Recovery:** restore z backup w ciągu 4h
- **Monitoring:** health check endpoint + alerty email przy downtime

### 5.6 RODO

- Pełna polityka prywatności (wyświetlana przy rejestracji)
- Zgoda na przetwarzanie danych (checkbox obowiązkowy)
- Prawo do usunięcia (klient usuwa konto → dane anonimizowane po 30 dniach)
- Minimalizacja danych: email, imię, nazwisko, telefon (opcj.), adres dostawy (opcj.)
- DPO — do ustalenia kto pełni rolę (Magda? Mateusz? zewnętrzna usługa?)
- Eksport danych klienta na żądanie (XLSX/CSV)

---

## 6. Data Model (przegląd)

Szczegółowy model danych z polami, typami i relacjami: patrz `DATA_MODEL.md`.

**Encje główne:**

```
User (klient/admin/dostawca)
  └── Subscription (abonament: paczka/jajka)
        └── ClientPackage (instancja paczki per klient per tydzień)

WeeklyPackage (template paczki na tydzień)
  ├── PackageItem (pozycja w paczce → Product)
  └── ClientPackage (instancje per klient)

Product (warzywo/zioło z sezonowością)

ChickenReservation (rezerwacja kurczaków per partia)

ExtraOrder (zamówienia poza abonamentem)
  └── ExtraOrderItem (pozycje zamówienia)

Payment (ewidencja płatności)

PickupPoint (punkt odbioru)

DeliveryZone (strefa dostawy do domu)

Announcement (ogłoszenia broadcast)

Notification (powiadomienia per user)
```

---

## 7. API / Integracje

### 7.1 Architektura API

- **Monolityczny Next.js** — API Routes (`/api/*`) w ramach jednej aplikacji
- **Autentykacja API:** cookie-based sessions (HttpOnly, Secure, SameSite=Strict)
- **Format:** JSON (request/response)

### 7.2 Główne grupy endpointów

| Grupa | Prefix | Opis |
|-------|--------|------|
| Auth | `/api/auth/*` | Login, register, logout, reset-password |
| Users | `/api/users/*` | CRUD klientów (admin only) |
| Packages | `/api/packages/*` | Tygodniowe paczki, zawartość, publikacja |
| Swaps | `/api/swaps/*` | Zamiany warzyw (klient), podsumowanie (admin) |
| Pickups | `/api/pickups/*` | Zgłoszenia braku, zaznaczanie odbiorów |
| Subscriptions | `/api/subscriptions/*` | CRUD subskrypcji |
| Payments | `/api/payments/*` | Ewidencja płatności (admin) |
| Chickens | `/api/chickens/*` | Rezerwacje kurczaków |
| Orders | `/api/orders/*` | Zamówienia poza abonamentem |
| Export | `/api/export/*` | Generowanie XLSX |
| Announcements | `/api/announcements/*` | Ogłoszenia broadcast |
| Notifications | `/api/notifications/*` | Lista powiadomień (in-app) |

### 7.3 Integracje zewnętrzne

| Integracja | Status w v1 | Opis |
|------------|------------|------|
| **Email (SMTP)** | ✅ MVP | Wysyłka powiadomień automatycznych (Resend, Mailgun lub SMTP) |
| **SMS** | ❌ Poza scope | Magda wysyła ręcznie, poza systemem |
| **Płatności online** | ❌ Faza 3 | Przelewy24/BLIK — nie w v1 |
| **Bank API** | ❌ Faza 2 | Auto-oznaczanie płatności — nie w v1 |
| **Facebook API** | ❌ Poza scope | FB działa równolegle, bez integracji |
| **Google Calendar** | ❌ Faza 3 | Integracja z kalendarzem — nie w v1 |
| **Księgowość** | ❌ Faza 3 | Fakturowanie — nie w v1 |

### 7.4 Wysyłka email — wymagania

- **Transactional email:** rejestracja, reset hasła, potwierdzenie zamówienia
- **Scheduled email:** wt (zawartość paczki), śr (deadline), pt (odbiór), przed ratą
- **Broadcast:** ogłoszenia admina do wybranych grup
- **Dostawca:** Resend (Free: 100 emails/dzień, wystarczy) lub Mailgun lub własny SMTP
- **Unsubscribe:** klient może wyłączyć powiadomienia email (RODO)

---

## 8. UI/UX Requirements

### 8.1 Zasady ogólne

- **Mobile-first:** projektowanie od 360px, rozszerzanie do desktop
- **Minimum klikania:** każda częsta akcja (zaznaczenie odbioru, zamiana warzywa) max 2 tapa
- **Język:** polski
- **Branding:** logo i kolory Green Leaf (do pozyskania od Magdy)
- **Framework UI:** Tailwind CSS + shadcn/ui (lub Radix) — spójne komponenty

### 8.2 Kluczowe ekrany

**Admin:**
1. **Dashboard** — podsumowanie tygodnia: ile paczek, ile odebranych, zaległe płatności, najbliższe deadliny
2. **Tworzenie paczki** — lista warzyw z checkboxami + ilości, przycisk "Publikuj"
3. **Lista klientów** — tabela z filtrem (abonament/zewnętrzny/aktywny), wyszukiwarka
4. **Lista odbiorów (farma)** — per punkt: checkboxy odbioru, 1 tap = odebrane
5. **Płatności** — tabela: klient, kwota, status, przycisk "Oznacz zapłacone"
6. **Eksport** — przycisk generujący XLSX z wyborem tygodnia/zakresu

**Dostawca:**
7. **Lista odbiorów (trasa)** — per punkt: imię, nazwisko, checkbox, offline-capable

**Klient:**
8. **Moja paczka** — zawartość tygodniowa + zamiany + deadline
9. **Mój abonament** — typ, ile paczek zostało, płatności, raty
10. **Kurczaki** — rezerwacje per partia, status
11. **Zamówienia** — lista złożonych zamówień + statusy

### 8.3 Nawigacja

- **Admin:** sidebar (desktop) / hamburger menu (mobile) z sekcjami: Dashboard, Paczki, Klienci, Płatności, Kurczaki, Ogłoszenia, Eksport
- **Klient:** bottom tab bar (mobile): Paczka, Abonament, Kurczaki, Zamówienia, Profil
- **Dostawca:** jeden ekran — lista odbiorów z przełącznikiem punktu

---

## 9. Acceptance Criteria — 14 elementów MVP

### MVP-1: Rejestracja/logowanie klientów

- [ ] Klient rejestruje się emailem + hasłem (formularz publiczny)
- [ ] Admin tworzy konto za klienta → klient dostaje email z linkiem do ustawienia hasła
- [ ] Admin może usunąć konto klienta (dane anonimizowane po 30 dniach)
- [ ] Reset hasła działa przez email (link ważny 24h)
- [ ] Przy rejestracji wymagana akceptacja regulaminu + polityki prywatności
- [ ] Po zalogowaniu klient widzi dashboard zgodny ze swoją rolą

### MVP-2: Subskrypcje (paczka warzywna + jajka)

- [ ] Klient widzi dostępne opcje abonamentu z cenami (paczka 24/12, jajka A-G)
- [ ] Admin przypisuje subskrypcję klientowi (typ, częstotliwość, punkt odbioru, model płatności)
- [ ] Admin edytuje subskrypcję (zmiana opcji, pauza, wznowienie)
- [ ] System prawidłowo nalicza koszt dostawy z góry (0/10/20 zł × liczba paczek)
- [ ] Klient widzi swój aktywny abonament z detalami

### MVP-3: Zarządzanie tygodniową zawartością paczki

- [ ] Admin tworzy paczkę tygodniową: wybiera 10-12 pozycji z listy sezonowych warzyw
- [ ] Admin publikuje paczkę → status zmienia się na "opublikowana"
- [ ] Po publikacji system wysyła email + in-app notification do klientów z aktywnym abonamentem paczki
- [ ] Klienci widzą zawartość paczki od momentu publikacji

### MVP-4: Zamiany produktów z deadlinem

- [ ] Klient widzi zawartość swojej paczki i może zamienić warzywa na dostępne zamienniki
- [ ] System blokuje zamiany po środzie 20:00 (przycisk nieaktywny + komunikat)
- [ ] Admin widzi podsumowanie zamian: kto zamienił co na co
- [ ] Admin widzi zagregowaną listę: ile sztuk każdego warzywa przygotować (po uwzględnieniu zamian)

### MVP-5: Zgłoszenie braku odbioru z deadlinem

- [ ] Klient może zgłosić "nie odbiorę w tym tygodniu" do środy 10:00
- [ ] Po środzie 10:00 formularz jest zablokowany
- [ ] Admin widzi listę zgłoszeń braku odbioru na dany tydzień
- [ ] System flaguje klientów którzy nie odebrali I nie zgłosili braku wcześniej

### MVP-6: Punkty odbioru + dostawa

- [ ] System zawiera 4 punkty odbioru (Kąkolewice, Komorniki, Puszczykowo, Baranowo) z adresami i godzinami
- [ ] Klient wybiera domyślny punkt odbioru przy rejestracji
- [ ] Klient może zmienić punkt odbioru (zmiana zapisuje się w profilu)
- [ ] Opcja dostawy do domu: klient podaje adres, system dolicza +20 zł z góry
- [ ] Koszty dostawy prawidłowo wchodzą w kwotę ratalną

### MVP-7: Status paczki (klient widzi postęp)

- [ ] Klient widzi status swojej paczki: oczekująca → skompletowana → do_odbioru → odebrana
- [ ] Status aktualizuje się w czasie rzeczywistym (po zaznaczeniu odbioru przez admina/dostawcę)
- [ ] Klient widzi licznik: "Paczka 8 z 24"
- [ ] Historia odebranych paczek jest dostępna

### MVP-8: Ewidencja płatności

- [ ] Admin widzi listę płatności per klient (status, metoda, rata)
- [ ] Admin oznacza płatność jako "zapłacone" jednym kliknięciem (wybiera metodę: przelew/gotówka/BLIK)
- [ ] System automatycznie wysyła przypomnienie emailem 5 dni przed terminem raty
- [ ] Klient widzi swój status płatności: ile wpłacił, ile zostało, następna rata kiedy
- [ ] Model ratalny prawidłowo rozbija kwotę na 3 raty (10.05 / 10.07 / 10.09) z uwzględnieniem kosztów dostawy

### MVP-9: Eksport do Excel (XLSX)

- [ ] Admin generuje plik XLSX z przyciskiem "Eksportuj" (wybór tygodnia)
- [ ] Arkusz ZBIORY: lista warzyw, ilości, waga, podsumowanie paczek per punkt
- [ ] Arkusz PAKOWANIE: lista klientów per lokalizacja z kolumnami: jajka, zmiany, zakupy, odebrane, płatność
- [ ] Arkusz ZMIANY: szczegóły zamian i zakupów poza abonamentem per klient
- [ ] Arkusz KURCZAKI: lista zamówień per lokalizacja z kolumnami: tuszki, waga, zapłacono, forma płatności
- [ ] Struktura arkuszy jest zgodna z szablonami Magdy (specyfikacja §19 w v0.4)
- [ ] Plik otwiera się poprawnie w Excel na Windows

### MVP-10: Ogłoszenia (broadcast)

- [ ] Admin tworzy ogłoszenie z wyborem grupy docelowej (wszyscy / paczka / jajka / kurczaki)
- [ ] Ogłoszenie jest wysyłane emailem + wyświetlane in-app
- [ ] Klient widzi listę ogłoszeń w aplikacji (posortowane od najnowszego)
- [ ] System obsługuje auto-powiadomienia: wt (paczka), śr (deadline), pt (odbiór), raty, kurczaki

### MVP-11: Zamówienia poza abonamentem

- [ ] Klient widzi listę dostępnych produktów z cenami
- [ ] Klient składa zamówienie (produkty + ilości)
- [ ] Admin widzi listę złożonych zamówień z przyciskami: Zatwierdź / Odrzuć (z komentarzem)
- [ ] Klient otrzymuje powiadomienie o zmianie statusu (email + in-app)
- [ ] Zamówienia poza abo pojawiają się w arkuszu XLSX (PAKOWANIE + ZMIANY)

### MVP-12: Edycja subskrypcji przez rolnika

- [ ] Admin edytuje subskrypcję klienta: zmiana typu (24→12), pauza, wznowienie
- [ ] Zmiana jest logowana (kto zmienił, kiedy, co zmienił)
- [ ] Klient widzi zaktualizowane dane subskrypcji po zmianie

### MVP-13: Zaznaczanie odbiorów (dostawca + farma)

- [ ] Farma: admin widzi listę klientów per punkt z checkboxami → zaznacza odbiór 1 tapem
- [ ] Dostawca: widzi osobną listę odbiorów per punkt → zaznacza odbiór 1 tapem
- [ ] Zaznaczenia farmy i dostawcy są NIEZALEŻNE (oba zapisywane osobno z timestampem i user_id)
- [ ] Lista dostawcy działa offline (zaznaczenia zapisują się w cache, synchronizacja po powrocie zasięgu)
- [ ] Admin widzi w jednym widoku: kto potwierdził odbiór (farma/dostawca/oba/żaden)

### MVP-14: Rezerwacje kurczaków

- [ ] Klient (RWS + zewnętrzny) rezerwuje kurczaki: wybiera partię (I/II/III) + liczbę tuszek
- [ ] Klient widzi cenę za kg (38 zł) + średnią wagę tuszki (2,8 kg) — NIE widzi kwoty
- [ ] Admin wpisuje wagę rzeczywistą po uboju → system wylicza kwotę (waga × 38 zł/kg)
- [ ] Status kurczaka: zarezerwowany → w_hodowli → gotowy → odebrany
- [ ] Klient zewnętrzny rejestruje się przez publiczny link i ma dostęp TYLKO do modułu kurczaków + zamówień poza abo
- [ ] Rezerwacje kurczaków pojawiają się w arkuszu XLSX (arkusz KURCZAKI)

---

## 10. Out of Scope (NIE robimy w v1)

### Produktowe
- Multi-sezon / archiwum danych (tylko sezon 2026)
- Komunikator prywatny rolnik ↔ klient (faza 2)
- Moduł wydarzeń/szkoleń z zapisami online (faza 2)
- Moduł praktyk zawodowych (faza 2)
- Raporty sezonowe / statystyki (faza 2)
- Multi-gospodarstwo (inne farmy RWS na platformie) (faza 3)

### Techniczne
- Płatności online (Przelewy24 / BLIK) — faza 3
- Integracja z kontem bankowym (auto-oznaczanie płatności) — faza 2
- Integracja z księgowością / fakturowaniem — faza 3
- Integracja z Google Calendar — faza 3
- Natywna aplikacja mobilna (PWA wystarczy)
- Multi-język (tylko polski)
- Panel analityczny / dashboard BI
- Integracja z Facebook API
- Integracja SMS (Magda wysyła ręcznie)
- Import klientów z Excela (klienci sami się rejestrują)
- Wersjonowanie polityki prywatności

---

## 11. Open Questions

### OQ-1: Zamiany warzyw — predefiniowane vs dowolne (pyt. 5)

`[WYMAGA DECYZJI MAGDY]`

**Pytanie:** Czy zamienniki są predefiniowane per warzywo (np. marchew można zamienić TYLKO na buraki, szpinak, seler) czy klient wybiera dowolne warzywo z tygodniowej listy?

**Opcje:**
- **A) Predefiniowane:** admin definiuje dozwolone zamienniki per warzywo. Więcej pracy przy setup, mniej chaosu.
- **B) Dowolne z listy:** klient zamienia na cokolwiek z listy tygodniowej. Mniej pracy admina, ale może generować dziwne kombinacje.

**Rekomendacja:** Opcja B (dowolne z listy) — prostsze do implementacji, mniejsze obciążenie Magdy. Jeśli pojawiają się problemy, można dodać ograniczenia później.

**Wpływ na implementację:** Opcja A wymaga dodatkowej tabeli `ProductSubstitute` i UI do zarządzania zamiennikami. Opcja B — nie.

### OQ-2: UI zamian warzyw — format interfejsu (pyt. 24)

`[WYMAGA DECYZJI MAGDY]`

**Pytanie:** Jak powinna wyglądać zamiana warzyw na telefonie klienta?

**Opcje:**
- **A) Lista z przyciskami "Zamień":** klient widzi listę pozycji paczki, klika "Zamień" przy wybranej → dropdown z zamiennikami
- **B) Formularz "Zamień X na Y":** klient wybiera z dropdown: co chce zamienić → na co
- **C) Checkboxy:** klient odznacza warzywa których nie chce, zaznacza które chce zamiast nich

**Rekomendacja:** Przygotować klikalne mockupy wszystkich 3 opcji, pokazać Magdzie na telefonie, podjąć decyzję na podstawie jej reakcji.

---

## 12. Sezon i kalendarz

- **Sezon:** 23 maja — 31 października 2026 (24 tygodnie)
- **Dane:** TYLKO sezon 2026
- **Odbiór:** soboty
- **Ogłoszenie zawartości:** wtorek
- **Deadline zamiany:** środa 20:00
- **Deadline zgłoszenia braku odbioru:** środa 10:00
- **Raty:** 10 maja / 10 lipca / 10 września

## 13. Kontakty

| Osoba | Rola | Kontakt |
|-------|------|---------|
| Magda Partyka | Właścicielka, główna admin | tel. 697-247-835 |
| Filip Partyka | Współwłaściciel | — |
| Mateusz Glazer | Informatyk, hosting | biuro@x-web.pl, 697-670-761 |

---

*Dokument PRD v1.0 — na podstawie specyfikacji v0.4 (835 linii, 25 pytań od Magdy) + analizy luk. 24 user stories, 14 elementów MVP z acceptance criteria, 2 otwarte pytania. Data: 2026-03-20.*
