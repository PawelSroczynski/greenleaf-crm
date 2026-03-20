# 🌿 GreenLeaf CRM — Model Danych v1.0

> Źródło prawdy dla Prisma schema
> Konwencje: snake_case w bazie, camelCase w Prisma, UUID jako klucze główne
> Baza: PostgreSQL

---

## 1. User (użytkownik)

Wspólna tabela dla wszystkich ról: admin, dostawca, klient_rws, klient_zewnetrzny.

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | Klucz główny | `a1b2c3d4-...` |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Login + kontakt | `magda@greenleaf.pl` |
| password_hash | VARCHAR(255) | NOT NULL | Hasło bcrypt/argon2 | `$2b$12$...` |
| first_name | VARCHAR(100) | NOT NULL | Imię | `Magda` |
| last_name | VARCHAR(100) | NOT NULL | Nazwisko | `Partyka` |
| phone | VARCHAR(20) | NULL | Telefon (opcjonalny, do SMS poza systemem) | `697247835` |
| role | ENUM | NOT NULL | `admin`, `dostawca`, `klient_rws`, `klient_zewnetrzny` | `klient_rws` |
| default_pickup_point_id | UUID FK | NULL | Domyślny punkt odbioru → PickupPoint | |
| delivery_option | ENUM | NOT NULL, DEFAULT 'pickup' | `pickup`, `home_delivery` | `pickup` |
| delivery_address | TEXT | NULL | Adres dostawy do domu (jeśli delivery_option = home_delivery) | `ul. Lipowa 5, Komorniki` |
| notes | TEXT | NULL | Notatki admina o kliencie | `Alergia na seler` |
| created_by | ENUM | NOT NULL, DEFAULT 'self' | `self`, `admin` | `self` |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Admin może dezaktywować | `true` |
| privacy_accepted_at | TIMESTAMP | NULL | Data akceptacji polityki prywatności | `2026-05-01 10:30` |
| created_at | TIMESTAMP | NOT NULL | Data utworzenia konta | |
| updated_at | TIMESTAMP | NOT NULL | Data ostatniej aktualizacji | |

**Indeksy:** UNIQUE(email), INDEX(role), INDEX(is_active)
**Relacje:** 1:N → Subscription, 1:N → ClientPackage, 1:N → ChickenReservation, 1:N → Payment, 1:N → ExtraOrder

---

## 2. Subscription (subskrypcja / abonament)

Abonament klienta na paczki warzywne lub jajka.

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| user_id | UUID FK | NOT NULL | Klient → User | |
| type | ENUM | NOT NULL | `paczka_24`, `paczka_12`, `jajka_A`...`jajka_G` | `paczka_24` |
| season | VARCHAR(4) | NOT NULL | Rok sezonu | `2026` |
| frequency | ENUM | NOT NULL | `weekly`, `biweekly` | `weekly` |
| egg_quantity | INT | NULL | Ilość jajek/tydzień (10/20/30) — tylko dla subskr. jajek | `20` |
| status | ENUM | NOT NULL, DEFAULT 'active' | `active`, `paused`, `cancelled` | `active` |
| payment_model | ENUM | NOT NULL | `upfront`, `installments_3` | `installments_3` |
| total_packages | INT | NOT NULL | Łączna liczba paczek w sezonie | `24` |
| packages_remaining | INT | NOT NULL | Ile paczek pozostało | `16` |
| delivery_cost_per_package | DECIMAL(5,2) | NOT NULL, DEFAULT 0 | 0 / 10 / 20 zł | `10.00` |
| total_amount | DECIMAL(8,2) | NOT NULL | Łączna kwota (abonament + dostawa) | `2400.00` |
| edited_by | UUID FK | NULL | Kto ostatnio edytował → User (admin) | |
| created_at | TIMESTAMP | NOT NULL | | |
| updated_at | TIMESTAMP | NOT NULL | | |

**Indeksy:** INDEX(user_id), INDEX(status), INDEX(season)
**Relacje:** N:1 → User, 1:N → Payment (raty)

**Logika cenowa:**
- Paczka 24: 2160 zł + (delivery_cost × 24)
- Paczka 12: 1080 zł + (delivery_cost × 12)
- Jajka: wg opcji A-G (patrz cennik w PRD §5.2)

---

## 3. WeeklyPackage (paczka tygodniowa — template)

Tworzona przez admina co tydzień. Definiuje zawartość paczki dla wszystkich klientów.

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| week_number | INT | NOT NULL | Nr tygodnia 1-24 | `8` |
| pickup_date | DATE | NOT NULL | Data odbioru (sobota) | `2026-07-11` |
| published_at | TIMESTAMP | NULL | Kiedy opublikowana (wtorek) | `2026-07-07 10:00` |
| swap_deadline | TIMESTAMP | NOT NULL | Deadline zamian (środa 20:00) | `2026-07-08 20:00` |
| absence_deadline | TIMESTAMP | NOT NULL | Deadline braku odbioru (środa 10:00) | `2026-07-08 10:00` |
| status | ENUM | NOT NULL, DEFAULT 'draft' | `draft`, `published`, `completed` | `published` |
| season | VARCHAR(4) | NOT NULL | | `2026` |
| created_at | TIMESTAMP | NOT NULL | | |

**Indeksy:** UNIQUE(week_number, season), INDEX(pickup_date)
**Relacje:** 1:N → PackageItem, 1:N → ClientPackage

---

## 4. PackageItem (pozycja w paczce tygodniowej)

Relacja M:N między WeeklyPackage i Product.

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| weekly_package_id | UUID FK | NOT NULL | → WeeklyPackage | |
| product_id | UUID FK | NOT NULL | → Product | |
| quantity | DECIMAL(6,2) | NOT NULL | Ilość per paczka | `1.0` |
| unit | VARCHAR(20) | NOT NULL | Jednostka (szt/kg/pęczek/doniczka/100g) | `pęczek` |

**Indeksy:** UNIQUE(weekly_package_id, product_id)

---

## 5. Product (produkt — warzywo/zioło)

Lista wszystkich produktów z sezonowością.

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| name | VARCHAR(100) | NOT NULL | Nazwa produktu | `Marchew` |
| category | ENUM | NOT NULL | `warzywo`, `ziolo`, `owoc` | `warzywo` |
| unit | VARCHAR(20) | NOT NULL | Domyślna jednostka | `pęczek` |
| available_months | INT[] | NOT NULL | Miesiące dostępności (5-10) | `[5,6,7,8,9,10]` |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Czy dostępny w tym sezonie | `true` |
| photo_url | VARCHAR(500) | NULL | Zdjęcie produktu | |

**Indeksy:** UNIQUE(name), INDEX(is_active)

---

## 6. ClientPackage (paczka klienta — instancja per klient per tydzień)

Instancja paczki tygodniowej dla konkretnego klienta.

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| weekly_package_id | UUID FK | NOT NULL | → WeeklyPackage | |
| user_id | UUID FK | NOT NULL | → User (klient) | |
| subscription_id | UUID FK | NOT NULL | → Subscription | |
| status | ENUM | NOT NULL, DEFAULT 'pending' | `pending`, `assembled`, `ready`, `picked_up`, `not_picked_up` | `pending` |
| pickup_point_id | UUID FK | NULL | Punkt odbioru → PickupPoint | |
| is_home_delivery | BOOLEAN | NOT NULL, DEFAULT false | Czy dostawa do domu | |
| absence_reported | BOOLEAN | NOT NULL, DEFAULT false | Klient zgłosił brak odbioru | |
| absence_reported_at | TIMESTAMP | NULL | Kiedy zgłoszony brak | |
| pickup_confirmed_farm | BOOLEAN | NOT NULL, DEFAULT false | Farma potwierdziła odbiór | |
| pickup_confirmed_farm_at | TIMESTAMP | NULL | Kiedy farma potwierdziła | |
| pickup_confirmed_farm_by | UUID FK | NULL | Kto potwierdził (admin) → User | |
| pickup_confirmed_driver | BOOLEAN | NOT NULL, DEFAULT false | Dostawca potwierdził odbiór | |
| pickup_confirmed_driver_at | TIMESTAMP | NULL | Kiedy dostawca potwierdził | |
| pickup_confirmed_driver_by | UUID FK | NULL | Kto potwierdził (dostawca) → User | |
| note | TEXT | NULL | Notatka | |
| created_at | TIMESTAMP | NOT NULL | | |
| updated_at | TIMESTAMP | NOT NULL | | |

**Indeksy:** UNIQUE(weekly_package_id, user_id), INDEX(status), INDEX(pickup_point_id)
**Relacje:** N:1 → WeeklyPackage, N:1 → User, N:1 → Subscription, 1:N → Swap

---

## 7. Swap (zamiana warzywa w paczce klienta)

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| client_package_id | UUID FK | NOT NULL | → ClientPackage | |
| original_product_id | UUID FK | NOT NULL | Oryginalny produkt → Product | |
| replacement_product_id | UUID FK | NOT NULL | Zamiennik → Product | |
| created_at | TIMESTAMP | NOT NULL | Kiedy dokonano zamiany | |

**Indeksy:** INDEX(client_package_id)
**Constraint:** created_at ≤ swap_deadline paczki tygodniowej

---

## 8. ChickenReservation (rezerwacja kurczaków)

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| user_id | UUID FK | NOT NULL | → User | |
| batch | ENUM | NOT NULL | `batch_1`, `batch_2`, `batch_3` | `batch_1` |
| planned_date | DATE | NOT NULL | Planowana data odbioru | `2026-05-30` |
| carcass_count | INT | NOT NULL | Liczba zamówionych tuszek | `5` |
| wants_giblets | BOOLEAN | NOT NULL, DEFAULT false | Czy chce podroby | `true` |
| actual_weight_kg | DECIMAL(6,2) | NULL | Waga rzeczywista po uboju (wpisuje admin) | `14.20` |
| price_per_kg | DECIMAL(5,2) | NOT NULL, DEFAULT 38.00 | Cena za kg | `38.00` |
| avg_carcass_weight | DECIMAL(4,2) | NOT NULL, DEFAULT 2.80 | Średnia waga tuszki (info) | `2.80` |
| total_amount | DECIMAL(8,2) | NULL | Kwota = actual_weight × price_per_kg | `539.60` |
| status | ENUM | NOT NULL, DEFAULT 'reserved' | `reserved`, `in_breeding`, `ready`, `picked_up` | `reserved` |
| payment_status | ENUM | NOT NULL, DEFAULT 'unpaid' | `unpaid`, `paid` | `unpaid` |
| payment_method | ENUM | NULL | `cash`, `transfer`, `blik` | |
| pickup_point_id | UUID FK | NULL | → PickupPoint | |
| note | TEXT | NULL | | |
| created_at | TIMESTAMP | NOT NULL | | |
| updated_at | TIMESTAMP | NOT NULL | | |

**Indeksy:** INDEX(user_id), INDEX(batch), INDEX(status)

---

## 9. ExtraOrder (zamówienie poza abonamentem)

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| user_id | UUID FK | NOT NULL | → User (klient) | |
| status | ENUM | NOT NULL, DEFAULT 'submitted' | `submitted`, `approved`, `rejected`, `ready`, `picked_up` | `submitted` |
| approved_by | UUID FK | NULL | → User (admin) | |
| admin_note | TEXT | NULL | Komentarz admina (przy odrzuceniu) | `Brak dostępnych buraków` |
| pickup_point_id | UUID FK | NULL | → PickupPoint | |
| submitted_at | TIMESTAMP | NOT NULL | | |
| approved_at | TIMESTAMP | NULL | | |
| created_at | TIMESTAMP | NOT NULL | | |

**Indeksy:** INDEX(user_id), INDEX(status)
**Relacje:** 1:N → ExtraOrderItem

---

## 10. ExtraOrderItem (pozycja zamówienia poza abo)

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| extra_order_id | UUID FK | NOT NULL | → ExtraOrder | |
| product_id | UUID FK | NOT NULL | → Product | |
| quantity | DECIMAL(6,2) | NOT NULL | Ilość | `2.0` |
| unit_price | DECIMAL(6,2) | NOT NULL | Cena jednostkowa | `5.00` |
| unit | VARCHAR(20) | NOT NULL | Jednostka | `kg` |

---

## 11. Payment (płatność)

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| user_id | UUID FK | NOT NULL | → User | |
| type | ENUM | NOT NULL | `subscription`, `chicken`, `extra_order`, `delivery` | `subscription` |
| subscription_id | UUID FK | NULL | → Subscription (jeśli type = subscription) | |
| chicken_reservation_id | UUID FK | NULL | → ChickenReservation (jeśli type = chicken) | |
| amount | DECIMAL(8,2) | NOT NULL | Kwota | `720.00` |
| installment_number | INT | NULL | Nr raty (1/2/3) lub NULL jeśli z góry | `1` |
| installment_due_date | DATE | NULL | Termin raty | `2026-05-10` |
| status | ENUM | NOT NULL, DEFAULT 'unpaid' | `paid`, `unpaid`, `partial` | `paid` |
| method | ENUM | NULL | `transfer`, `cash`, `blik` | `transfer` |
| paid_at | TIMESTAMP | NULL | Data wpłaty | |
| marked_by | UUID FK | NULL | Kto oznaczył → User (admin) | |
| note | TEXT | NULL | | |
| created_at | TIMESTAMP | NOT NULL | | |
| updated_at | TIMESTAMP | NOT NULL | | |

**Indeksy:** INDEX(user_id), INDEX(status), INDEX(type), INDEX(installment_due_date)

---

## 12. PickupPoint (punkt odbioru)

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| name | VARCHAR(100) | NOT NULL | Nazwa punktu | `Komorniki` |
| address | TEXT | NOT NULL | Adres | `koło Poznania` |
| gps_lat | DECIMAL(9,6) | NULL | Szerokość GPS | `52.3450` |
| gps_lon | DECIMAL(9,6) | NULL | Długość GPS | `16.8067` |
| pickup_day | VARCHAR(10) | NOT NULL, DEFAULT 'saturday' | Dzień odbioru | `saturday` |
| hours_from | TIME | NOT NULL | Godzina od | `08:00` |
| hours_to | TIME | NOT NULL | Godzina do | `09:30` |
| extra_cost | DECIMAL(5,2) | NOT NULL, DEFAULT 0 | Koszt dodatkowy per paczka | `10.00` |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | | `true` |

**Dane seed:**
- Kąkolewice 17a (8:30-11:30, 0 zł)
- Komorniki (8:00-9:30, 10 zł)
- Puszczykowo (10:00-11:00, 10 zł)
- Baranowo, ul. Alabastrowa (9:00-11:00, 10 zł)

---

## 13. DeliveryZone (strefa dostawy do domu)

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| name | VARCHAR(100) | NOT NULL | Nazwa strefy | `Poznań okolice` |
| localities | TEXT[] | NOT NULL | Lista miejscowości | `["Komorniki","Puszczykowo"]` |
| cost | DECIMAL(5,2) | NOT NULL | Koszt dostawy per paczka | `20.00` |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | | `true` |

**Dane seed:**
- Strefa lokalna: Chodzież, Margonin, Szamocin, Wągrowiec, Piła (20 zł)
- Strefa Poznań: Komorniki, Puszczykowo (20 zł)

---

## 14. Announcement (ogłoszenie)

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| author_id | UUID FK | NOT NULL | → User (admin) | |
| content | TEXT | NOT NULL | Treść ogłoszenia | `Nowa paczka...` |
| target_group | ENUM | NOT NULL | `all`, `package`, `eggs`, `chickens` | `package` |
| type | ENUM | NOT NULL | `package_content`, `info`, `reminder`, `event` | `package_content` |
| channel | ENUM | NOT NULL, DEFAULT 'both' | `email`, `in_app`, `both` | `both` |
| sent_at | TIMESTAMP | NULL | Kiedy wysłano | |
| created_at | TIMESTAMP | NOT NULL | | |

**Indeksy:** INDEX(target_group), INDEX(sent_at)

---

## 15. Notification (powiadomienie per user)

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| user_id | UUID FK | NOT NULL | → User | |
| announcement_id | UUID FK | NULL | → Announcement (jeśli z ogłoszenia) | |
| title | VARCHAR(200) | NOT NULL | Tytuł | `Zawartość paczki #8` |
| body | TEXT | NOT NULL | Treść | `Marchew, szpinak...` |
| type | ENUM | NOT NULL | `package`, `deadline`, `pickup`, `payment`, `chicken`, `system` | `package` |
| is_read | BOOLEAN | NOT NULL, DEFAULT false | Czy przeczytane | `false` |
| read_at | TIMESTAMP | NULL | | |
| created_at | TIMESTAMP | NOT NULL | | |

**Indeksy:** INDEX(user_id, is_read), INDEX(created_at)

---

## 16. AuditLog (log zmian — audyt)

| Pole | Typ | Nullable | Opis | Przykład |
|------|-----|----------|------|---------|
| id | UUID | PK | | |
| user_id | UUID FK | NOT NULL | Kto dokonał zmiany → User | |
| entity_type | VARCHAR(50) | NOT NULL | Nazwa encji | `Subscription` |
| entity_id | UUID | NOT NULL | ID zmienionego rekordu | |
| action | ENUM | NOT NULL | `create`, `update`, `delete` | `update` |
| changes | JSONB | NOT NULL | Stare i nowe wartości | `{"status": ["active","paused"]}` |
| created_at | TIMESTAMP | NOT NULL | | |

**Indeksy:** INDEX(entity_type, entity_id), INDEX(user_id), INDEX(created_at)
**Retencja:** 90 dni

---

## Diagram relacji (ASCII)

```
User ─────────┬──── 1:N ──── Subscription
              ├──── 1:N ──── ClientPackage
              ├──── 1:N ──── ChickenReservation
              ├──── 1:N ──── Payment
              ├──── 1:N ──── ExtraOrder
              ├──── 1:N ──── Notification
              └──── N:1 ──── PickupPoint (default)

WeeklyPackage ─┬──── 1:N ──── PackageItem ──── N:1 ──── Product
               └──── 1:N ──── ClientPackage ──── 1:N ──── Swap
                                                           ├── N:1 ── Product (original)
                                                           └── N:1 ── Product (replacement)

Subscription ──── 1:N ──── Payment (raty)

ExtraOrder ──── 1:N ──── ExtraOrderItem ──── N:1 ──── Product

Announcement ──── 1:N ──── Notification
```

---

*Model danych v1.0 — 16 encji, gotowy jako źródło prawdy dla Prisma schema. Data: 2026-03-20.*
