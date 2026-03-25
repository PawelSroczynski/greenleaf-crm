

### GREENLEAF CRM — KOMPLETNA CHECKLISTA TDD
Wersja 1.0 — 24 marca 2026
Pokrycie: 100% PRD Faza 1 (pkt 1-10) + 100% PRD Faza 2 (pkt 11-15)


Metoda: TDD Classic (Red → Green → Refactor)



---




---

## ZASADY LEAN (obowiązkowe)

Cel: małe kroki, małe fuck-upy, szybka korekta.

1. JEDEN CHECKBOX = JEDEN COMMIT
   Agent robi JEDEN checkbox, commituje, uruchamia testy.
   Zielone → następny checkbox.
   Czerwone → napraw TERAZ, nie idź dalej.

2. DEPLOY PO KAŻDEJ FAZIE (nie na końcu)
   Po Fazie 1 (auth) → deploy staging. Sprawdź logowanie na prawdziwym URL.
   Po Fazie 3 (paczki) → deploy staging. Sprawdź rdzeń.
   Nie czekaj na Fazę 8 z pierwszym deploy.

3. SMOKE TEST PO KAŻDYM DEPLOY
   Po każdym deploy staging — 3 scenariusze:
   a) Zaloguj się jako admin → widzisz panel?
   b) Zaloguj się jako klient → widzisz paczkę?
   c) Wykonaj główną akcję tej fazy → działa?

4. MAKSYMALNY BLAST RADIUS = 1 FAZA
   Faza się wysypie → git revert do końca poprzedniej fazy.
   Poprzednia faza ZAWSZE działa na staging.
   Nigdy nie tracisz więcej niż 1 fazę pracy.

5. FEATURE FLAG dla ryzykownych funkcji
   Auto-powiadomienia (Faza 6) → za flagą. Włączasz gdy Magda potwierdzi.
   Eksport Excel → za flagą do weryfikacji formatu z Magdą.

6. ZERO BIG BANG
   Nigdy nie wdrażaj 3 faz naraz.
   Nigdy nie rób "naprawię wszystko na końcu".
   Każda faza zamknięta = działa samodzielnie.

7. ROLLBACK PLAN
   Przed każdą fazą: git tag faza-X-start
   Po zakończeniu fazy: git tag faza-X-done
   Problem? git revert do tagu.


## FAZA 0 — FUNDAMENT (~2h)

---


Cel: postawić projekt, bazę danych ze WSZYSTKIMI 12 modelami, seed z realnymi danymi, runner testów.




### SETUP PROJEKTU


- [ ] Inicjalizacja Next.js 14 z App Router, TypeScript, Tailwind CSS (agent)

- [ ] Konfiguracja ESLint + Prettier (agent)

- [ ] Instalacja Prisma + klient PostgreSQL (agent)

- [ ] Instalacja Vitest + React Testing Library + happy-dom (agent)

- [ ] Konfiguracja vitest.config.ts z aliasami (agent)

- [ ] Struktura katalogów: app/, lib/, prisma/, tests/, components/ (agent)




### SCHEMA PRISMA — WSZYSTKIE 12 MODELI

- [ ] Model User — id, imię, nazwisko, telefon (unikatowy), email, hasło (hash), rola (ADMIN/CLIENT), punkt odbioru domyślny, opcja dostawy, adres dostawy, notatki, data dołączenia, sezon (agent)

- [ ] Model Subscription — id, klient_id, typ (PACZKA_24/PACZKA_12/JAJKA_A/JAJKA_B/JAJKA_C/JAJKA_D/JAJKA_E/JAJKA_F/JAJKA_G), sezon, częstotliwość (CO_TYDZIEN/CO_2_TYGODNIE), ilość jajek (10/20/30/null), status (AKTYWNA/PAUZA/ZAKONCZONA), model płatności (Z_GORY/RATY_3), paczki pozostałe, koszt dostawy za paczkę (0/10/20), wytłaczanki (int) (agent)

- [ ] Model WeeklyBox — id, tydzień nr (1-24), data odbioru, data publikacji, deadline zamiany (środa 18:00), deadline rezygnacji (środa 10:00), produkty (relacja many-to-many z Product) (agent)

- [ ] Model ClientBox — id, weeklyBox_id, klient_id, zamiany (relacja z ProductSubstitute), status (OCZEKUJACA/SKOMPLETOWANA/DO_ODBIORU/ODEBRANA/NIE_ODEBRANA), punkt odbioru, zgłoszenie braku odbioru (bool + timestamp), notatka (agent)

- [ ] Model Product — id, nazwa, kategoria (WARZYWO/ZIOLO/OWOC), jednostka (SZT/KG/PECZEK/DONICZKA), dostępność miesięczna (tablica: MAJ-PAZ), zdjęcie URL (agent)

- [ ] Model ProductSubstitute — id, clientBox_id, produkt oryginalny_id, zamiennik_id, data zgłoszenia (agent)

- [ ] Model ChickenReservation — id, klient_id, partia (I/II/III), ilość tuszek, planowana data, waga rzeczywista, kwota (waga x 38), status (ZAREZERWOWANY/W_HODOWLI/GOTOWY/ODEBRANY), płatność status (agent)

- [ ] Model Payment — id, klient_id, typ (ABONAMENT/KURCZAK/WYDARZENIE/DOSTAWA), kwota, data wpłaty, metoda (PRZELEW/GOTOWKA/BLIK), rata nr (1/2/3 lub null), termin raty, status (ZAPLACONE/NIEZAPLACONE/CZESCIOWO), notatka (agent)

- [ ] Model PickupPoint — id, nazwa, adres, współrzędne GPS, dzień odbioru, godziny od/do, koszt dodatkowy (0/10), aktywny (bool) (agent)

- [ ] Model DeliveryZone — id, nazwa obszaru, miejscowości (tablica stringów), koszt (20 zł), aktywna (bool) (agent)

- [ ] Model Announcement — id, treść, data, autor_id, grupa docelowa (WSZYSCY/PACZKA/JAJKA/KURCZAKI), typ (ZAWARTOSC_PACZKI/INFO/PRZYPOMNIENIE/WYDARZENIE) (agent)

- [ ] Model Event — id, tytuł, opis, data od, data do, cena, miejsc max, miejsc zajętych, lokalizacja, status (OTWARTY/ZAMKNIETY/ZAKONCZONY), url (agent)

- [ ] Relacje między modelami — User hasMany Subscription, ClientBox, Payment, ChickenReservation; WeeklyBox hasMany ClientBox; Product many-to-many WeeklyBox; itd. (agent)

- [ ] Uruchomienie prisma migrate dev — schema się kompiluje bez błędów (agent)





### SEED Z PEŁNYMI DANYMI


- [ ] Seed: 4 punkty odbioru — Kąkolewice (0 zł), Komorniki (10 zł), Puszczykowo (10 zł), Baranowo (10 zł) z adresami i godzinami z PRD (agent)

- [ ] Seed: strefy dostawy — Komorniki, Puszczykowo, Chodzież, Margonin, Szamocin, Wągrowiec, Piła, koszt 20 zł (agent)

- [ ] Seed: MINIMUM 45 produktów (warzyw i ziół) z sezonowością per miesiąc (maj-październik) zgodnie z sekcją 8 PRD — mix sałat, rukola, szpinak, jarmuż, pomidory, cukinia, marchew, buraki, ziemniaki, brokuł itd. (agent)

- [ ] Seed: zamienniki produktów — logiczne pary (np. buraki → marchew, szpinak → jarmuż, cukinia → patison) (agent)
    Zakres: relacja wiele-do-wielu Product → Product jako dozwolone zamiany
    Nie obejmuje: UI zamiany w paczce (Faza 3), walidacja sezonowa zamienników

- [ ] Seed: 2 użytkowników admin (Magda, Filip) + 5 klientów testowych z różnymi subskrypcjami (agent)

- [ ] Seed: 3 partie kurczaków (I: 30.05, II: 01.08, III: 10.10) (agent)

- [ ] Seed: 2 wydarzenia (Joel Salatin 10.03, Dochodowe Gospodarstwo 12-13.09) (agent)
    Zakres: lista wydarzeń z opisem, datą, ceną, limitem miejsc + zapisy online
    Nie obejmuje: płatności online za wydarzenie (poza MVP — ewidencja jak w Fazie 5)

- [ ] Seed: przykładowe płatności (mix: z góry, raty, częściowo zapłacone) (agent)





### TESTY FUNDAMENTU


- [ ] Test: baza danych łączy się poprawnie (agent)

- [ ] Test: seed uruchomiony — w bazie jest 45+ produktów (agent)

- [ ] Test: seed uruchomiony — w bazie są 4 punkty odbioru (agent)

- [ ] Test: seed uruchomiony — strefy dostawy mają poprawne miejscowości (agent)

- [ ] Test: seed uruchomiony — są 2 admini i 5 klientów (agent)


--- STOP FAZA 0 ---
Kryteria weryfikacji:
- prisma migrate dev przechodzi bez błędów
- prisma db seed tworzy pełne dane
- vitest run przechodzi — 5 testów zielonych
- Wszystkie 12 modeli widoczne w Prisma Studio
- npx prisma studio otwiera się i pokazuje dane
Nie przechodź dalej dopóki WSZYSTKO nie jest zielone.

---




---



## FAZA 1 — AUTH I REJESTRACJA (~2h)

---


Cel: logowanie telefon + hasło, role ADMIN/CLIENT, middleware chroniący strony, rejestracja z wyborem punktu odbioru.




### LOGIKA AUTH


- [ ] Test: klient loguje się telefonem 697247835 i hasłem — dostaje sesję (agent)

- [ ] Test: klient wpisuje zły numer telefonu — system odmawia logowania (agent)

- [ ] Test: klient wpisuje złe hasło — system odmawia logowania (agent)

- [ ] Test: admin loguje się i widzi panel admina (agent)

- [ ] Test: klient loguje się i widzi panel klienta (agent)

- [ ] Test: niezalogowany użytkownik próbuje wejść na /dashboard — redirect na /login (agent)

- [ ] Test: klient próbuje wejść na /admin — redirect na /dashboard (brak uprawnień) (agent)

- [ ] Implementacja NextAuth z credentials provider (telefon + hasło) (agent)

- [ ] Hashowanie haseł bcrypt przy rejestracji i seedzie (agent)

- [ ] Middleware — ochrona tras /admin (tylko ADMIN), /dashboard (zalogowani) (agent)

- [ ] Sesja zawiera: userId, rola, imię (agent)





### REJESTRACJA KLIENTA


- [ ] Test: nowy klient wypełnia formularz — imię, nazwisko, telefon, email, hasło, punkt odbioru — konto zostaje utworzone (agent)

- [ ] Test: klient próbuje zarejestrować się z istniejącym numerem telefonu — system odmawia (agent)

- [ ] Test: formularz wymaga wyboru punktu odbioru z 4 opcji LUB dostawy do domu (agent)

- [ ] Test: klient wybiera dostawę do domu — musi podać adres (agent)

- [ ] Test: klient wybiera punkt Komorniki — system zapisuje koszt dostawy 10 zł/paczka (agent)

- [ ] Test: klient wybiera dostawę do domu — system sprawdza czy adres jest w strefie dostawy i zapisuje koszt 20 zł/paczka (agent)

- [ ] Strona /register z formularzem (agent)

- [ ] Strona /login z polami telefon + hasło (agent)

- [ ] Strona /dashboard — szkielet z powitaniem klienta (agent)

- [ ] Strona /admin — szkielet z powitaniem admina (agent)


--- STOP FAZA 1 ---
Kryteria weryfikacji:
- 13 testów zielonych (7 auth + 6 rejestracja)
- Można się zalogować jako admin i klient
- Middleware blokuje nieautoryzowany dostęp
- Rejestracja tworzy użytkownika z punktem odbioru
- Strony /login, /register, /dashboard, /admin renderują się
Nie przechodź dalej dopóki WSZYSTKO nie jest zielone.

---




---



## FAZA 2 — SUBSKRYPCJE I PRODUKTY (~3h)

---


Cel: model subskrypcji (paczka pełna/połowa, jajka A-G), lista produktów z sezonowością, zamienniki, cennik.




### SUBSKRYPCJE WARZYWNE


- [ ] Test: admin tworzy subskrypcję paczka pełna (24 szt, co tydzień, 2160 zł) dla klienta — system zapisuje (agent)

- [ ] Test: admin tworzy subskrypcję paczka połowa (12 szt, co 2 tygodnie, 1080 zł) dla klienta — system zapisuje (agent)

- [ ] Test: klient z paczką połową ma 12 w polu paczki_pozostałe (agent)

- [ ] Test: klient z paczką pełną ma 24 w polu paczki_pozostałe (agent)

- [ ] Test: subskrypcja ma pole model_płatności — z góry lub raty 3 (agent)

- [ ] Test: subskrypcja z ratami ma 3 terminy: 10 maj, 10 lipiec, 10 wrzesień (agent)

- [ ] Implementacja CRUD subskrypcji warzywnych (API routes) (agent)

- [ ] Panel admin — formularz tworzenia subskrypcji dla klienta (agent)

- [ ] Panel klienta — widok "Moja subskrypcja" z typem, ceną, paczkami pozostałymi (agent)





### SUBSKRYPCJE JAJEK


- [ ] Test: admin tworzy subskrypcję jajek opcja A (10 szt/tydzień, 24 tyg, 24 wytłaczanki, 480 zł) — system zapisuje (agent)
    Zakres: tworzenie subskrypcji jajek opcje A-G z ilością i częstotliwością
    Nie obejmuje: wytłaczanki i licznik (osobny checkbox), przerwa w subskrypcji (osobny checkbox)

- [ ] Test: admin tworzy subskrypcję jajek opcja B (20 szt/tydzień, 24 tyg, 48 wytłaczanek, 960 zł) — system zapisuje (agent)
    Zakres: tworzenie subskrypcji jajek opcje A-G z ilością i częstotliwością
    Nie obejmuje: wytłaczanki i licznik (osobny checkbox), przerwa w subskrypcji (osobny checkbox)

- [ ] Test: admin tworzy subskrypcję jajek opcja C (30 szt/tydzień, 24 tyg, 72 wytłaczanki, 1440 zł) — system zapisuje (agent)
    Zakres: tworzenie subskrypcji jajek opcje A-G z ilością i częstotliwością
    Nie obejmuje: wytłaczanki i licznik (osobny checkbox), przerwa w subskrypcji (osobny checkbox)

- [ ] Test: admin tworzy subskrypcję jajek opcja D (10 szt/co 2 tyg, 12 tyg, 12 wytłaczanek, 240 zł) — system zapisuje (agent)
    Zakres: tworzenie subskrypcji jajek opcje A-G z ilością i częstotliwością
    Nie obejmuje: wytłaczanki i licznik (osobny checkbox), przerwa w subskrypcji (osobny checkbox)

- [ ] Test: admin tworzy subskrypcję jajek opcja E (20 szt/co 2 tyg, 12 tyg, 24 wytłaczanki, 480 zł) — system zapisuje (agent)
    Zakres: tworzenie subskrypcji jajek opcje A-G z ilością i częstotliwością
    Nie obejmuje: wytłaczanki i licznik (osobny checkbox), przerwa w subskrypcji (osobny checkbox)

- [ ] Test: admin tworzy subskrypcję jajek opcja F (30 szt/co 2 tyg, 12 tyg, 36 wytłaczanek, 720 zł) — system zapisuje (agent)
    Zakres: tworzenie subskrypcji jajek opcje A-G z ilością i częstotliwością
    Nie obejmuje: wytłaczanki i licznik (osobny checkbox), przerwa w subskrypcji (osobny checkbox)

- [ ] Test: admin tworzy subskrypcję jajek opcja G (indywidualna, cena ustalana ręcznie) — system zapisuje (agent)
    Zakres: tworzenie subskrypcji jajek opcje A-G z ilością i częstotliwością
    Nie obejmuje: wytłaczanki i licznik (osobny checkbox), przerwa w subskrypcji (osobny checkbox)

- [ ] Test: klient z subskrypcją jajek opcja A widzi "10 jajek co tydzień, 24 wytłaczanki" (agent)

- [ ] Test: klient zgłasza przerwę w subskrypcji jajek — status zmienia się na PAUZA (agent)

- [ ] Test: admin wznawia subskrypcję jajek po przerwie — status wraca na AKTYWNA (agent)

- [ ] Implementacja CRUD subskrypcji jajek (API routes) (agent)

- [ ] Panel admin — formularz tworzenia subskrypcji jajek z wyborem opcji A-G (agent)

- [ ] Panel klienta — widok subskrypcji jajek z licznikiem wytłaczanek (agent)





### PRODUKTY I SEZONOWOŚĆ


- [ ] Test: produkt "Pomidory" ma dostępność lipiec-październik — w maju nie pojawia się na liście (agent)

- [ ] Test: produkt "Szpinak" ma dostępność maj, wrzesień, październik — w lipcu nie pojawia się (agent)

- [ ] Test: w czerwcu dostępnych jest minimum 19 produktów (zgodnie z sekcją 8 PRD) (agent)

- [ ] Test: produkt ma zdefiniowane zamienniki — buraki mają zamiennik marchew (agent)
    Zakres: relacja wiele-do-wielu Product → Product jako dozwolone zamiany
    Nie obejmuje: UI zamiany w paczce (Faza 3), walidacja sezonowa zamienników

- [ ] Test: zamiennik jest dwukierunkowy — jeśli buraki → marchew, to marchew → buraki (agent)

- [ ] Implementacja API: lista produktów filtrowana po miesiącu (agent)

- [ ] Implementacja API: zamienniki produktu (agent)
    Zakres: relacja wiele-do-wielu Product → Product jako dozwolone zamiany
    Nie obejmuje: UI zamiany w paczce (Faza 3), walidacja sezonowa zamienników

- [ ] Panel admin — zarządzanie produktami (lista, dodaj, edytuj, sezonowość) (agent)


--- STOP FAZA 2 ---
Kryteria weryfikacji:
- 21 testów zielonych (6 warzywne + 10 jajka + 5 produkty)
- Subskrypcje: paczka 24, paczka 12, jajka A-G — wszystkie warianty działają
- Produkty filtrują się po miesiącu
- Zamienniki działają dwukierunkowo
- Panel klienta pokazuje subskrypcję z ceną i licznikiem
Nie przechodź dalej dopóki WSZYSTKO nie jest zielone.

---




---



## FAZA 3 — PACZKI TYGODNIOWE — RDZEŃ (~4h)

---


Cel: pełny cykl tygodniowy — od tworzenia paczki przez zamiany, braki odbioru, kompletację, aż po zaznaczenie odbioru w sobotę.



### TWORZENIE PACZKI TYGODNIOWEJ (ROLNIK)

- [ ] Test: admin tworzy paczkę na tydzień 1 (data 23.05) z 10 produktami z listy majowych warzyw — system zapisuje (agent)
    Zakres: formularz tworzenia + zapis do bazy + lista produktów filtrowana po aktualnym miesiącu
    Nie obejmuje: publikacja do klientów (osobny checkbox), lista kompletacji (osobny checkbox)

- [ ] Test: admin próbuje dodać produkt niedostępny w maju (np. pomidory) — system odmawia (agent)

- [ ] Test: po utworzeniu paczki system automatycznie generuje instancje ClientBox dla każdego klienta z aktywną subskrypcją (agent)

- [ ] Test: klient z paczką połową (co 2 tygodnie) — dostaje ClientBox tylko w tygodniach parzystych (agent)

- [ ] Test: admin publikuje paczkę (ustawia datę publikacji) — klienci widzą zawartość od wtorku (agent)
    Zakres: zmiana statusu na PUBLISHED + ustawienie daty publikacji (wtorek)
    Nie obejmuje: auto-powiadomienie klientów (Faza 6), ogłoszenie na FB (poza systemem)




### ZAMIANY PRODUKTÓW (KLIENT)

- [ ] Test: klient zamienia buraki na marchew w środę o 15:00 — system przyjmuje zamianę (agent)

- [ ] Test: klient próbuje zamienić warzywo po środzie 18:00 — system odmawia (agent)

- [ ] Test: klient próbuje zamienić warzywo w czwartek — system odmawia (deadline minął) (agent)

- [ ] Test: klient zamienia szpinak na jarmuż — system pokazuje tylko dostępne zamienniki dla szpinaku (agent)
    Zakres: relacja wiele-do-wielu Product → Product jako dozwolone zamiany
    Nie obejmuje: UI zamiany w paczce (Faza 3), walidacja sezonowa zamienników

- [ ] Test: klient próbuje zamienić warzywo na coś spoza listy zamienników — system odmawia (agent)

- [ ] Test: klient zamienia 2 produkty w jednej paczce — obie zamiany zapisane (agent)

- [ ] Test: admin widzi podsumowanie zamian — kto zamienił co na co (agent)

- [ ] Implementacja API: zamiana produktu w ClientBox (z walidacją deadline + zamienników) (agent)

- [ ] Panel klienta — widok zawartości paczki z przyciskami "zamień" przy każdym produkcie (agent)

- [ ] Panel klienta — wybór zamiennika z dostępnej listy (agent)




### ZGŁOSZENIE BRAKU ODBIORU (KLIENT)

- [ ] Test: klient kliknie "nie odbiorę" we wtorek — system zapisuje zgłoszenie (agent)

- [ ] Test: klient kliknie "nie odbiorę" w środę o 9:00 — system przyjmuje (agent)

- [ ] Test: klient próbuje zgłosić brak odbioru w środę o 11:00 — system odmawia (po 10:00) (agent)

- [ ] Test: klient próbuje zgłosić brak odbioru w czwartek — system odmawia (agent)

- [ ] Test: klient ze zgłoszonym brakiem odbioru — paczka nie jest liczona do kompletacji (agent)

- [ ] Test: admin widzi flagę przy klientach którzy NIE zgłosili braku i NIE odebrali — brak refundacji (agent)

- [ ] Implementacja API: zgłoszenie braku odbioru (z walidacją deadline środa 10:00) (agent)

- [ ] Panel klienta — przycisk "Nie odbiorę w tym tygodniu" (widoczny do środy 10:00) (agent)




### STATUS KOMPLETACJI (ADMIN)

- [ ] Test: nowo utworzona paczka klienta ma status OCZEKUJACA (agent)

- [ ] Test: admin zmienia status na SKOMPLETOWANA — system zapisuje (agent)

- [ ] Test: admin zmienia status na DO_ODBIORU — system zapisuje (agent)

- [ ] Test: admin zmienia status na ODEBRANA — system zapisuje i zmniejsza licznik paczek pozostałych o 1 (agent)
    Zakres: wyświetlenie X z 24 (lub 12) paczek odebranych na dashboardzie klienta
    Nie obejmuje: powiadomienia o kończącej się subskrypcji (poza MVP)

- [ ] Test: admin oznacza paczkę jako NIE_ODEBRANA — system zapisuje (klient nie zgłosił braku) (agent)

- [ ] Test: statusy idą tylko do przodu — nie można cofnąć z ODEBRANA do OCZEKUJACA (agent)

- [ ] Implementacja API: zmiana statusu ClientBox (agent)

- [ ] Panel admin — widok kompletacji z przyciskami zmiany statusu (agent)





### PODSUMOWANIE ILE WARZYW PRZYGOTOWAĆ


- [ ] Test: paczka tydzień 1 ma 20 klientów, 3 zamieniło buraki na marchew — system liczy: 17x buraki, 23x marchew (agent)

- [ ] Test: podsumowanie uwzględnia tylko paczki ze statusem innym niż "nie odbiorę" (agent)

- [ ] Test: podsumowanie pokazuje każdy produkt z ilością sztuk do przygotowania (agent)

- [ ] Implementacja API: podsumowanie warzyw na tydzień (agent)

- [ ] Panel admin — widok "Ile przygotować" z listą warzyw i ilościami (agent)





### LISTA ODBIORU PER PUNKT


- [ ] Test: na punkcie Komorniki jest 8 klientów — lista pokazuje 8 pozycji z zawartością paczek (agent)

- [ ] Test: lista odbioru zawiera: imię klienta, zawartość paczki (z zamianami), jajka jeśli ma subskrypcję (agent)

- [ ] Test: lista odbioru wyklucza klientów którzy zgłosili brak odbioru (agent)

- [ ] Test: lista jest filtrowalna per punkt odbioru (agent)

- [ ] Test: lista jest eksportowalna do wydruku (agent)

- [ ] Implementacja API: lista odbioru per punkt per tydzień (agent)

- [ ] Panel admin — widok listy odbioru z filtrem per punkt + przycisk drukuj (agent)





### ZAZNACZENIE KTO ODEBRAŁ


- [ ] Test: admin zaznacza klienta Kowalski jako "odebrał" — status zmienia się na ODEBRANA (agent)

- [ ] Test: admin zaznacza klienta Nowak jako "nie odebrał" — status zmienia się na NIE_ODEBRANA (agent)

- [ ] Test: po zaznaczeniu odbioru — licznik klienta zmniejsza się (np. z 24 na 23 paczki pozostałe) (agent)

- [ ] Panel admin — checkboxy przy każdym kliencie na liście odbioru (agent)





### HISTORIA PACZEK KLIENTA


- [ ] Test: klient z 3 odebranymi paczkami widzi listę 3 paczek z datami i zawartością (agent)

- [ ] Test: historia pokazuje zamiany (np. "buraki → marchew") (agent)

- [ ] Test: klient widzi licznik "3 z 24 paczek odebranych" (agent)

- [ ] Implementacja API: historia paczek klienta (agent)
    Zakres: lista odebranych paczek klienta z zawartością i datą
    Nie obejmuje: statystyki popularności warzyw (Faza 7)

- [ ] Panel klienta — strona "Moje paczki" z historią i licznikiem X/24 (agent)


--- STOP FAZA 3 ---
Kryteria weryfikacji:
- 35 testów zielonych
- Pełny cykl tygodniowy działa: tworzenie → zamiany → braki → kompletacja → odbiór
- Deadline środa 18:00 (zamiany) i środa 10:00 (brak odbioru) blokują poprawnie
- Podsumowanie warzyw liczy się z zamianami
- Lista odbioru per punkt jest kompletna
- Historia klienta z licznikiem X/24
Nie przechodź dalej dopóki WSZYSTKO nie jest zielone.

---




---



## FAZA 4 — JAJKA I KURCZAKI (~3h)

---


Cel: pełny moduł jajek (przerwa, wytłaczanki) + rezerwacja kurczaków (3 partie, waga, rozliczenie).



### MODUŁ JAJEK — ROZSZERZENIE

- [ ] Test: klient z jajkami opcja A widzi "10 jajek" na liście odbioru w sobotę (agent)

- [ ] Test: klient z jajkami opcja B (co tydzień) — jajka pojawiają się co tydzień (agent)

- [ ] Test: klient z jajkami opcja D (co 2 tygodnie) — jajka pojawiają się co 2 tygodnie (agent)

- [ ] Test: klient zgłasza przerwę w jajkach na tydzień 5 — w tym tygodniu brak jajek na liście odbioru (agent)

- [ ] Test: przerwa w jajkach wymaga zgłoszenia do środy 10:00 — po terminie system odmawia (agent)

- [ ] Test: admin widzi licznik wytłaczanek per klient — klient opcja A po 10 tygodniach ma wydane 10 wytłaczanek z 24 (agent)

- [ ] Test: lista odbioru na sobotę zawiera jajka obok paczki warzywnej (agent)

- [ ] Implementacja API: przerwa/wznowienie jajek (agent)

- [ ] Implementacja API: licznik wytłaczanek (agent)

- [ ] Panel klienta — widok subskrypcji jajek z przyciskiem przerwa/wznów + licznik wytłaczanek (agent)

- [ ] Panel admin — widok jajek per klient z wytłaczankami (agent)





### MODUŁ KURCZAKÓW


- [ ] Test: klient rezerwuje 2 tuszki na partię I (30.05) — system zapisuje rezerwację (agent)

- [ ] Test: klient rezerwuje 1 tuszkę na partię II i 3 na partię III — system zapisuje osobno per partia (agent)

- [ ] Test: klient nie chce kurczaków — brak rezerwacji, system akceptuje (agent)

- [ ] Test: admin wpisuje wagę rzeczywistą tuszki 2.8 kg — system liczy kwotę 2.8 x 38 = 106.40 zł (agent)

- [ ] Test: admin wpisuje wagę 3.2 kg — kwota = 121.60 zł (agent)

- [ ] Test: admin zmienia status rezerwacji na W_HODOWLI → GOTOWY → ODEBRANY (agent)

- [ ] Test: klient widzi swoje rezerwacje ze statusami i planowanymi datami (agent)

- [ ] Test: admin widzi listę wszystkich rezerwacji per partia z podsumowaniem ilości tuszek (agent)

- [ ] Test: płatność za kurczaki jest osobna od abonamentu — rejestrowana przy odbiorze (agent)

- [ ] Implementacja CRUD rezerwacji kurczaków (API routes) (agent)

- [ ] Panel klienta — formularz rezerwacji kurczaków (partia + ilość) (agent)

- [ ] Panel klienta — widok "Moje kurczaki" ze statusem per partia (agent)

- [ ] Panel admin — zarządzanie rezerwacjami: lista, waga, zmiana statusu (agent)

- [ ] Panel admin — podsumowanie per partia: ile tuszek łącznie zarezerwowanych (agent)


--- STOP FAZA 4 ---
Kryteria weryfikacji:
- 16 testów zielonych (7 jajka + 9 kurczaki)
- Jajka na liście odbioru — poprawna częstotliwość per opcję
- Przerwa w jajkach działa z deadlinem
- Wytłaczanki się liczą
- Kurczaki: rezerwacja, waga, kwota 38 zł/kg, status
- Płatność za kurczaki osobno od abonamentu
Nie przechodź dalej dopóki WSZYSTKO nie jest zielone.

---




---



## FAZA 5 — PŁATNOŚCI (~2h)

---


Cel: ewidencja płatności z ratami, statusy, metody, koszty dostawy, podsumowanie klienta, eksport Excel.




### EWIDENCJA PŁATNOŚCI


- [ ] Test: admin rejestruje płatność z góry 2160 zł za paczkę pełną — status ZAPLACONE (agent)

- [ ] Test: admin rejestruje płatność raty 1 (720 zł, termin 10.05) — status klienta CZESCIOWO (agent)

- [ ] Test: admin rejestruje ratę 2 i ratę 3 — po trzeciej status zmienia się na ZAPLACONE (agent)

- [ ] Test: klient nie zapłacił nic — status NIEZAPLACONE (agent)

- [ ] Test: płatność z metodą PRZELEW — system zapisuje (agent)

- [ ] Test: płatność z metodą GOTOWKA — system zapisuje (agent)

- [ ] Test: płatność z metodą BLIK — system zapisuje (agent)

- [ ] Test: model ratalny ma 3 terminy: 10 maja, 10 lipca, 10 września — system weryfikuje (agent)

- [ ] Implementacja CRUD płatności (API routes) (agent)

- [ ] Panel admin — formularz rejestracji płatności (kwota, metoda, rata nr, typ) (agent)





### KOSZTY DOSTAWY


- [ ] Test: klient z punktem Komorniki — koszt dostawy 10 zł x 24 paczki = 240 zł doliczane do sumy (agent)

- [ ] Test: klient z dostawą do domu — koszt 20 zł x 24 paczki = 480 zł doliczane (agent)

- [ ] Test: klient odbierający na gospodarstwie — koszt dostawy 0 zł (agent)

- [ ] Test: koszty dostawy pojawiają się na podsumowaniu klienta (agent)

- [ ] Implementacja automatycznego naliczania kosztów dostawy per subskrypcja (agent)





### PODSUMOWANIE KLIENTA


- [ ] Test: klient z paczką pełną (2160 zł) + jajka A (480 zł) + dostawa Komorniki (240 zł) — łączna kwota = 2880 zł (agent)

- [ ] Test: klient zapłacił 2 raty po 720 zł — widzi "wpłacono: 1440 zł, pozostało: 1440 zł, następna rata: 10 września" (agent)

- [ ] Test: klient z kurczakami partia I (2 tuszki x 2.8 kg = 212.80 zł) — kwota za kurczaki osobno (agent)

- [ ] Test: admin widzi podsumowanie finansowe klienta: wszystkie subskrypcje, wpłaty, zaległości (agent)

- [ ] Panel klienta — strona "Moje płatności" z podsumowaniem (agent)

- [ ] Panel admin — widok finansowy per klient (agent)





### EKSPORT EXCEL


- [ ] Test: eksport listy klientów zawiera: imię, nazwisko, telefon, email, punkt odbioru, typ subskrypcji (agent)

- [ ] Test: eksport płatności zawiera: klient, kwota, metoda, data, status, rata nr (agent)

- [ ] Test: eksport listy kompletacji na tydzień zawiera: klient, zawartość paczki z zamianami, punkt, status (agent)

- [ ] Test: eksport zamówień zawiera: klient, typ subskrypcji, jajka opcja, kurczaki ilość per partia (agent)

- [ ] Test: pliki eksportowane w formacie .xlsx (agent)

- [ ] Implementacja eksportu Excel z biblioteką xlsx (agent)

- [ ] Panel admin — przyciski "Eksport do Excel" na stronach: klienci, płatności, kompletacja, zamówienia (agent)


--- STOP FAZA 5 ---
Kryteria weryfikacji:
- 21 testów zielonych (8 ewidencja + 4 dostawa + 4 podsumowanie + 5 eksport)
- Raty 3-etapowe działają z terminami
- Statusy: zapłacone/niezapłacone/częściowo — wyliczają się automatycznie
- Koszty dostawy naliczane per punkt/strefa
- Podsumowanie klienta łączy wszystkie subskrypcje + wpłaty
- 4 typy eksportu Excel generują się poprawnie
Nie przechodź dalej dopóki WSZYSTKO nie jest zielone.

---




---



## FAZA 6 — KOMUNIKACJA I POWIADOMIENIA (~2h)

---


Cel: ogłoszenia z grupami docelowymi, auto-powiadomienia (wtorek/środa/piątek/raty), komunikator rolnik-klient.



### OGŁOSZENIA (BROADCAST)

- [ ] Test: admin tworzy ogłoszenie dla grupy WSZYSCY — wszyscy klienci je widzą (agent)

- [ ] Test: admin tworzy ogłoszenie dla grupy PACZKA — widzą go tylko klienci z subskrypcją warzywną (agent)

- [ ] Test: admin tworzy ogłoszenie dla grupy JAJKA — widzą go tylko klienci z subskrypcją jajek (agent)

- [ ] Test: admin tworzy ogłoszenie dla grupy KURCZAKI — widzą go tylko klienci z rezerwacjami kurczaków (agent)

- [ ] Test: ogłoszenie typu ZAWARTOSC_PACZKI zawiera listę warzyw z danego tygodnia (agent)

- [ ] Test: klient widzi listę ogłoszeń posortowanych od najnowszego (agent)

- [ ] Test: system oznacza które ogłoszenia klient przeczytał (agent)

- [ ] Implementacja CRUD ogłoszeń (API routes) (agent)

- [ ] Panel admin — formularz tworzenia ogłoszenia (treść, grupa docelowa, typ) (agent)

- [ ] Panel klienta — strona "Ogłoszenia" z listą i oznaczeniem przeczytanych (agent)




### AUTO-POWIADOMIENIA

- [ ] Test: we wtorek po publikacji paczki — system generuje powiadomienie "Zawartość paczki na ten tydzień: [lista warzyw]" (agent)

- [ ] Test: w środę o 9:00 — system generuje przypomnienie "Deadline na zamiany dziś o 18:00" (agent)

- [ ] Test: w piątek — system generuje przypomnienie "Jutro odbiór! Punkt [nazwa], godziny [od-do]" z punktem klienta (agent)

- [ ] Test: 3 dni przed terminem raty — system generuje przypomnienie "Rata do 10 [miesiąc], kwota [X] zł" (agent)

- [ ] Test: kurczaki gotowe — system generuje powiadomienie "Partia [nr] gotowa! Odbiór w sobotę [data]" (agent)

- [ ] Test: powiadomienia trafiają do skrzynki klienta w aplikacji (widoczne na dashboardzie) (agent)

- [ ] Test: klient widzi liczbę nieprzeczytanych powiadomień (badge) (agent)

- [ ] Implementacja systemu powiadomień (model Notification lub rozszerzenie Announcement) (agent)

- [ ] Implementacja logiki auto-generowania powiadomień per typ zdarzenia (agent)

- [ ] Panel klienta — dzwonek z liczbą nieprzeczytanych + lista powiadomień (agent)





### KOMUNIKATOR PRYWATNY


- [ ] Test: klient wysyła wiadomość do rolnika — rolnik widzi ją w panelu admin (agent)

- [ ] Test: rolnik odpowiada klientowi — klient widzi odpowiedź w panelu klienta (agent)

- [ ] Test: wiadomości sortowane chronologicznie (najnowsza na dole) (agent)

- [ ] Test: rolnik widzi listę konwersacji z klientami z ostatnią wiadomością (agent)

- [ ] Test: nowa wiadomość od klienta — rolnik widzi oznaczenie "nowa" (agent)

- [ ] Implementacja modelu Message (nadawca, odbiorca, treść, timestamp, przeczytane) (agent)

- [ ] Implementacja API: wysyłanie i odbieranie wiadomości (agent)

- [ ] Panel klienta — strona "Wiadomości" z oknem czatu (agent)

- [ ] Panel admin — lista konwersacji + okno czatu z klientem (agent)


--- STOP FAZA 6 ---
Kryteria weryfikacji:
- 19 testów zielonych (7 ogłoszenia + 7 auto-powiadomienia + 5 komunikator)
- Ogłoszenia filtrują się per grupa docelowa
- Auto-powiadomienia generują się per typ zdarzenia
- Komunikator działa w obie strony (klient → rolnik, rolnik → klient)
- Badge z liczbą nieprzeczytanych na dashboardzie
Nie przechodź dalej dopóki WSZYSTKO nie jest zielone.

---




---



## FAZA 7 — WYDARZENIA I RAPORTY (~2h)

---


Cel: moduł wydarzeń z zapisami i limitem miejsc, raporty sezonowe.




### WYDARZENIA I SZKOLENIA


- [ ] Test: admin tworzy wydarzenie "Joel Salatin" z datą 10.03, ceną 200 zł, limitem 50 miejsc — system zapisuje (agent)

- [ ] Test: admin tworzy wydarzenie "Dochodowe Gospodarstwo" z datą 12-13.09, limitem 30 miejsc — system zapisuje (agent)

- [ ] Test: klient zapisuje się na wydarzenie — miejsc zajętych +1 (agent)

- [ ] Test: wydarzenie z limitem 50 miejsc, 50 zapisanych — kolejny klient dostaje info "brak miejsc" (agent)

- [ ] Test: klient widzi listę dostępnych wydarzeń z opisem, datą, ceną, wolnymi miejscami (agent)

- [ ] Test: admin widzi listę uczestników danego wydarzenia (agent)
    Zakres: lista wydarzeń z opisem, datą, ceną, limitem miejsc + zapisy online
    Nie obejmuje: płatności online za wydarzenie (poza MVP — ewidencja jak w Fazie 5)

- [ ] Test: admin eksportuje listę uczestników do Excel (agent)

- [ ] Test: admin zmienia status wydarzenia na ZAMKNIETY — klienci nie mogą się już zapisywać (agent)
    Zakres: lista wydarzeń z opisem, datą, ceną, limitem miejsc + zapisy online
    Nie obejmuje: płatności online za wydarzenie (poza MVP — ewidencja jak w Fazie 5)

- [ ] Test: płatność za wydarzenie rejestrowana osobno (typ WYDARZENIE) (agent)

- [ ] Implementacja CRUD wydarzeń (API routes) (agent)

- [ ] Implementacja API: zapis/wypis klienta na wydarzenie (agent)

- [ ] Panel klienta — strona "Wydarzenia" z listą i przyciskiem zapisu (agent)
    Zakres: lista wydarzeń z opisem, datą, ceną, limitem miejsc + zapisy online
    Nie obejmuje: płatności online za wydarzenie (poza MVP — ewidencja jak w Fazie 5)

- [ ] Panel admin — zarządzanie wydarzeniami + lista uczestników + eksport (agent)
    Zakres: lista wydarzeń z opisem, datą, ceną, limitem miejsc + zapisy online
    Nie obejmuje: płatności online za wydarzenie (poza MVP — ewidencja jak w Fazie 5)





### RAPORTY SEZONOWE


- [ ] Test: raport "popularność produktów" — sortuje warzywa od najczęściej zostawianych (nie zamienianych) do najczęściej zamienianych (agent)

- [ ] Test: raport "aktywność klientów" — ile paczek odebranych, ile nieodebranych, ile zamian per klient (agent)

- [ ] Test: raport "przychody sezonu" — suma wpłat per typ (abonament/kurczaki/wydarzenia/dostawy) (agent)
    Zakres: lista wydarzeń z opisem, datą, ceną, limitem miejsc + zapisy online
    Nie obejmuje: płatności online za wydarzenie (poza MVP — ewidencja jak w Fazie 5)

- [ ] Test: raport "punkty odbioru" — ile klientów per punkt, trend (agent)

- [ ] Test: raporty obejmują wybrany zakres dat (filtr od-do) (agent)

- [ ] Test: raporty eksportowalne do Excel (agent)

- [ ] Implementacja API: generowanie raportów (agent)

- [ ] Panel admin — strona "Raporty" z 4 raportami + filtrami + eksport (agent)


--- STOP FAZA 7 ---
Kryteria weryfikacji:
- 15 testów zielonych (9 wydarzenia + 6 raporty)
- Wydarzenia z limitem miejsc i zapisami działają
- Lista uczestników z eksportem
- 4 raporty generują się z poprawnymi danymi
- Eksport raportów do Excel
Nie przechodź dalej dopóki WSZYSTKO nie jest zielone.

---




---



## FAZA 8 — DEPLOY I PRODUKCJA (~2h)

---


Cel: wdrożenie na produkcję — PostgreSQL, Vercel, migracje, seed produkcyjny, domena, test end-to-end.




### KONFIGURACJA PRODUKCYJNA


- [ ] Utworzenie bazy PostgreSQL na Vercel Postgres lub Supabase (agent)

- [ ] Konfiguracja zmiennych środowiskowych: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL (agent)

- [ ] Uruchomienie prisma migrate deploy na produkcji (agent)

- [ ] Seed produkcyjny: 4 punkty odbioru, strefy dostawy, 45+ produktów, konta admin (Magda, Filip) — BEZ klientów testowych (agent)

- [ ] Weryfikacja: Prisma Studio na produkcji pokazuje poprawne dane (agent)





### DEPLOY VERCEL


- [ ] Konfiguracja projektu na Vercel (repo GitHub → auto-deploy) (agent)

- [ ] Build przechodzi bez błędów na Vercel (agent)

- [ ] Konfiguracja domeny (do uzgodnienia z Magdą — np. crm.agropartyka.com lub greenleaf.enklava.co) (agent)

- [ ] SSL certyfikat aktywny (agent)

- [ ] Środowisko produkcyjne dostępne pod docelowym URL (agent)




### TEST END-TO-END NA PRODUKCJI

- [ ] Test e2e: rejestracja nowego klienta z punktem odbioru Komorniki (agent)

- [ ] Test e2e: logowanie klienta telefonem i hasłem (agent)

- [ ] Test e2e: logowanie admina (Magda) (agent)

- [ ] Test e2e: admin tworzy paczkę tygodniową z 10 produktami (agent)
    Zakres: formularz tworzenia + zapis do bazy + lista produktów filtrowana po aktualnym miesiącu
    Nie obejmuje: publikacja do klientów (osobny checkbox), lista kompletacji (osobny checkbox)

- [ ] Test e2e: klient widzi zawartość paczki i zamienia 1 produkt (agent)

- [ ] Test e2e: klient zgłasza brak odbioru (agent)
    Zakres: przycisk 'nie odbiorę' + walidacja deadline środa 10:00 + zapis do ClientBox
    Nie obejmuje: flagowanie bez zgłoszenia (osobny checkbox), refundacja (poza systemem)

- [ ] Test e2e: admin widzi podsumowanie warzyw do przygotowania (agent)

- [ ] Test e2e: admin widzi listę odbioru per punkt (agent)

- [ ] Test e2e: admin rejestruje płatność (agent)

- [ ] Test e2e: admin tworzy ogłoszenie i klient je widzi (agent)

- [ ] Test e2e: eksport klientów do Excel (agent)

- [ ] Test e2e: klient rezerwuje kurczaki na partię I (agent)

- [ ] Test e2e: cała aplikacja działa na telefonie (responsive) (agent)

- [ ] Naprawienie ewentualnych bugów z testów e2e (agent)

- [ ] Dokumentacja: README.md z instrukcją dla Magdy (jak się zalogować, podstawowe operacje) (agent)


--- STOP FAZA 8 ---
Kryteria weryfikacji:
- Produkcja działa pod docelową domeną
- SSL aktywny
- Migracje i seed przeszły
- 13 testów e2e przechodzi na produkcji
- Aplikacja responsywna na telefonie
- README dla Magdy gotowe
Nie przechodź dalej dopóki WSZYSTKO nie jest zielone — TO JEST OSTATECZNA WERYFIKACJA PRZED ODDANIEM.

---




---




### PODSUMOWANIE


---



STATYSTYKI


- Pozycji łącznie (checkboxy): 187
- Testów automatycznych (unit + integration): 140
- Testów e2e na produkcji: 13
- Faz: 9 (0-8)
- Bloków STOP z kryteriami: 9
- Modeli Prisma: 12 (+ Message dodany w Fazie 6)




### TIMELINE REALISTYCZNY


- Faza 0 — Fundament: 1 dzień
- Faza 1 — Auth: 1 dzień
- Faza 2 — Subskrypcje i produkty: 1-2 dni
- Faza 3 — Paczki tygodniowe: 2 dni
- Faza 4 — Jajka i kurczaki: 1-2 dni
- Faza 5 — Płatności: 1-2 dni
- Faza 6 — Komunikacja: 1-2 dni
- Faza 7 — Wydarzenia i raporty: 1 dzień
- Faza 8 — Deploy: 1 dzień

Razem: 10-14 dni roboczych (2-3 tygodnie)
Bufor na bugi i poprawki: +3 dni

REALISTYCZNIE: 15-17 dni roboczych = ~3.5 tygodnia





### POKRYCIE PRD


Faza 1 PRD (sekcja 11, punkty 1-10):
- 1. Rejestracja/logowanie — Faza 1 checklisty
- 2. Subskrypcje paczka + jajka — Faza 2 checklisty
- 3. Zarządzanie tygodniową paczką — Faza 3 checklisty
- 4. Zamiany z deadlinem — Faza 3 checklisty
- 5. Brak odbioru z deadlinem — Faza 3 checklisty
- 6. Punkty odbioru + dostawa — Faza 1 (rejestracja) + Faza 3 (listy)
- 7. Status paczki — Faza 3 checklisty
- 8. Ewidencja płatności — Faza 5 checklisty
- 9. Eksport Excel — Faza 5 checklisty
- 10. Ogłoszenia — Faza 6 checklisty

Faza 2 PRD (sekcja 11, punkty 11-15):
- 11. Rezerwacje kurczaków — Faza 4 checklisty
- 12. Powiadomienia auto — Faza 6 checklisty
- 13. Komunikator prywatny — Faza 6 checklisty
- 14. Wydarzenia/szkolenia — Faza 7 checklisty
- 15. Raporty sezonowe — Faza 7 checklisty

POKRYCIE: 15/15 = 100%





### ZASADA DLA AGENTA WDROŻENIOWEGO


Przy każdej fazie:
1. Napisz TESTY (Red) — testy muszą FAILOWAĆ
2. Napisz KOD (Green) — testy muszą PRZECHODZIĆ
3. Refaktoruj — testy nadal PRZECHODZĄ
4. Sprawdź blok STOP — wszystkie kryteria spełnione
5. Dopiero wtedy przejdź do następnej fazy

Nigdy nie pisz kodu bez testu.
Nigdy nie przechodź do następnej fazy z failującymi testami.
Nigdy nie pomijaj bloku STOP.
