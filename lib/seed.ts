// lib/seed.ts — generator kompletnych danych startowych (mock, frontend-only).
// Źródło prawdy: DATA_MODEL.md (16 encji) + PRD.md (§8 sezon, §9 MVP).

import {
  SEASON,
  PICKUP_DAY,
  DELIVERY_COST,
  PACKAGE_PRICE,
  PACKAGE_COUNT,
  SWAP_DEADLINE,
  ABSENCE_DEADLINE,
} from './config';
import { weeklyDeadline } from './deadlines';
import type {
  Product,
  Store,
  User,
  Subscription,
  WeeklyPackage,
  PackageItem,
  ClientPackage,
  PickupPoint,
  DeliveryZone,
} from './types';

// Deterministyczny generator ID (stabilny seed dla testów, bez zależności od crypto).
function makeIdGen() {
  let n = 0;
  return (prefix: string) => `${prefix}_${(++n).toString().padStart(4, '0')}`;
}

const NOW = `${SEASON}-04-01T08:00:00.000Z`;

// ---------- Helpery sezonowości ----------
export function isProductAvailable(product: Product, month: number): boolean {
  return product.availableMonths.includes(month);
}

export function productsAvailableInMonth(products: Product[], month: number): Product[] {
  return products.filter((p) => isProductAvailable(p, month) && p.isActive);
}

// ---------- Katalog produktów ----------
// availableMonths w zakresie 5–10 (maj–październik). Sezonowość realistyczna.
type ProductSeed = Pick<Product, 'name' | 'category' | 'unit' | 'availableMonths'>;

const PRODUCT_CATALOG: ProductSeed[] = [
  // Warzywa wczesne / liściaste
  { name: 'Rzodkiewka', category: 'warzywo', unit: 'pęczek', availableMonths: [5, 6] },
  { name: 'Sałata masłowa', category: 'warzywo', unit: 'szt', availableMonths: [5, 6, 7] },
  { name: 'Sałata rzymska', category: 'warzywo', unit: 'szt', availableMonths: [5, 6, 7, 8] },
  { name: 'Rukola', category: 'warzywo', unit: '100g', availableMonths: [5, 6, 7, 9, 10] },
  { name: 'Roszponka', category: 'warzywo', unit: '100g', availableMonths: [5, 9, 10] },
  { name: 'Szpinak', category: 'warzywo', unit: 'pęczek', availableMonths: [5, 6, 9, 10] },
  { name: 'Botwina', category: 'warzywo', unit: 'pęczek', availableMonths: [5, 6] },
  { name: 'Szczaw', category: 'warzywo', unit: 'pęczek', availableMonths: [5, 6, 7] },
  { name: 'Jarmuż', category: 'warzywo', unit: 'pęczek', availableMonths: [6, 9, 10] },
  { name: 'Kalarepa', category: 'warzywo', unit: 'szt', availableMonths: [5, 6, 7] },

  // Warzywa korzeniowe / cebulowe
  { name: 'Młoda marchew', category: 'warzywo', unit: 'pęczek', availableMonths: [6, 7] },
  { name: 'Marchew', category: 'warzywo', unit: 'kg', availableMonths: [7, 8, 9, 10] },
  { name: 'Burak ćwikłowy', category: 'warzywo', unit: 'kg', availableMonths: [6, 7, 8, 9, 10] },
  { name: 'Pietruszka korzeń', category: 'warzywo', unit: 'kg', availableMonths: [7, 8, 9, 10] },
  { name: 'Seler korzeniowy', category: 'warzywo', unit: 'szt', availableMonths: [8, 9, 10] },
  { name: 'Por', category: 'warzywo', unit: 'szt', availableMonths: [7, 8, 9, 10] },
  { name: 'Cebula', category: 'warzywo', unit: 'kg', availableMonths: [7, 8, 9, 10] },
  { name: 'Czosnek', category: 'warzywo', unit: 'szt', availableMonths: [7, 8] },
  { name: 'Ziemniak młody', category: 'warzywo', unit: 'kg', availableMonths: [6, 7] },
  { name: 'Ziemniak', category: 'warzywo', unit: 'kg', availableMonths: [8, 9, 10] },
  { name: 'Koper włoski (fenkuł)', category: 'warzywo', unit: 'szt', availableMonths: [6, 7, 8] },

  // Warzywa owocujące (NIE w maju)
  { name: 'Pomidor', category: 'warzywo', unit: 'kg', availableMonths: [7, 8, 9, 10] },
  { name: 'Pomidor koktajlowy', category: 'warzywo', unit: 'opakowanie', availableMonths: [7, 8, 9] },
  { name: 'Pomidor malinowy', category: 'warzywo', unit: 'kg', availableMonths: [8, 9, 10] },
  { name: 'Ogórek gruntowy', category: 'warzywo', unit: 'kg', availableMonths: [6, 7, 8, 9] },
  { name: 'Cukinia', category: 'warzywo', unit: 'szt', availableMonths: [6, 7, 8, 9] },
  { name: 'Kabaczek', category: 'warzywo', unit: 'szt', availableMonths: [8, 9, 10] },
  { name: 'Papryka', category: 'warzywo', unit: 'kg', availableMonths: [8, 9, 10] },
  { name: 'Bakłażan', category: 'warzywo', unit: 'szt', availableMonths: [8, 9] },
  { name: 'Fasolka szparagowa', category: 'warzywo', unit: 'kg', availableMonths: [7, 8, 9] },
  { name: 'Groszek cukrowy', category: 'warzywo', unit: 'kg', availableMonths: [6, 7] },
  { name: 'Bób', category: 'warzywo', unit: 'kg', availableMonths: [6, 7] },

  // Kapustne
  { name: 'Brokuł', category: 'warzywo', unit: 'szt', availableMonths: [6, 7, 9, 10] },
  { name: 'Kalafior', category: 'warzywo', unit: 'szt', availableMonths: [6, 7, 9, 10] },
  { name: 'Kapusta biała', category: 'warzywo', unit: 'szt', availableMonths: [7, 8, 9, 10] },
  { name: 'Kapusta włoska', category: 'warzywo', unit: 'szt', availableMonths: [8, 9, 10] },

  // Dynie (późno)
  { name: 'Dynia hokkaido', category: 'warzywo', unit: 'szt', availableMonths: [9, 10] },
  { name: 'Dynia piżmowa', category: 'warzywo', unit: 'szt', availableMonths: [9, 10] },

  // Zioła
  { name: 'Natka pietruszki', category: 'ziolo', unit: 'pęczek', availableMonths: [5, 6, 7, 8, 9, 10] },
  { name: 'Koperek', category: 'ziolo', unit: 'pęczek', availableMonths: [5, 6, 7, 8, 9, 10] },
  { name: 'Szczypiorek', category: 'ziolo', unit: 'pęczek', availableMonths: [5, 6, 7, 8, 9, 10] },
  { name: 'Bazylia', category: 'ziolo', unit: 'doniczka', availableMonths: [6, 7, 8, 9] },
  { name: 'Mięta', category: 'ziolo', unit: 'doniczka', availableMonths: [6, 7, 8, 9] },
  { name: 'Tymianek', category: 'ziolo', unit: 'doniczka', availableMonths: [6, 7, 8, 9] },
  { name: 'Oregano', category: 'ziolo', unit: 'doniczka', availableMonths: [6, 7, 8, 9] },
  { name: 'Kolendra', category: 'ziolo', unit: 'pęczek', availableMonths: [6, 7, 8, 9] },
  { name: 'Lubczyk', category: 'ziolo', unit: 'pęczek', availableMonths: [6, 7, 8, 9, 10] },
  { name: 'Szałwia', category: 'ziolo', unit: 'doniczka', availableMonths: [6, 7, 8, 9] },

  // Owoce
  { name: 'Truskawka', category: 'owoc', unit: 'kg', availableMonths: [6, 7] },
  { name: 'Malina', category: 'owoc', unit: 'kg', availableMonths: [7, 8, 9] },
  { name: 'Porzeczka czarna', category: 'owoc', unit: 'kg', availableMonths: [7, 8] },
  { name: 'Agrest', category: 'owoc', unit: 'kg', availableMonths: [7] },
  { name: 'Jabłko', category: 'owoc', unit: 'kg', availableMonths: [9, 10] },
  { name: 'Śliwka', category: 'owoc', unit: 'kg', availableMonths: [8, 9, 10] },
  { name: 'Gruszka', category: 'owoc', unit: 'kg', availableMonths: [9, 10] },
  { name: 'Aronia', category: 'owoc', unit: 'kg', availableMonths: [9, 10] },
];

export function createSeedData(): Store {
  const id = makeIdGen();
  const seasonStr = String(SEASON);

  // ---------- Punkty odbioru (DATA_MODEL.md §12) ----------
  const pickupPoints: PickupPoint[] = [
    {
      id: id('pp'),
      name: 'Kąkolewice 17a',
      address: 'Kąkolewice 17a',
      gpsLat: null,
      gpsLon: null,
      pickupDay: PICKUP_DAY,
      hoursFrom: '08:30',
      hoursTo: '11:30',
      extraCost: DELIVERY_COST.pickup_kakolewice,
      isActive: true,
    },
    {
      id: id('pp'),
      name: 'Komorniki',
      address: 'Komorniki koło Poznania',
      gpsLat: null,
      gpsLon: null,
      pickupDay: PICKUP_DAY,
      hoursFrom: '08:00',
      hoursTo: '09:30',
      extraCost: DELIVERY_COST.inne_punkty,
      isActive: true,
    },
    {
      id: id('pp'),
      name: 'Puszczykowo',
      address: 'Puszczykowo',
      gpsLat: null,
      gpsLon: null,
      pickupDay: PICKUP_DAY,
      hoursFrom: '10:00',
      hoursTo: '11:00',
      extraCost: DELIVERY_COST.inne_punkty,
      isActive: true,
    },
    {
      id: id('pp'),
      name: 'Baranowo, ul. Alabastrowa',
      address: 'Baranowo, ul. Alabastrowa',
      gpsLat: null,
      gpsLon: null,
      pickupDay: PICKUP_DAY,
      hoursFrom: '09:00',
      hoursTo: '11:00',
      extraCost: DELIVERY_COST.inne_punkty,
      isActive: true,
    },
    // Punkty demo reguł zarządzania pulą (Pulpit):
    // Oborniki — świeży, bez klientów i historii → jedyny USUWALNY (✕).
    {
      id: id('pp'),
      name: 'Oborniki',
      address: 'Oborniki',
      gpsLat: null,
      gpsLon: null,
      pickupDay: PICKUP_DAY,
      hoursFrom: '09:00',
      hoursTo: '10:00',
      extraCost: DELIVERY_COST.inne_punkty,
      isActive: true,
    },
    // Rogoźno — WYŁĄCZONY, bez obecnych klientów, ale z odbiorem w archiwum
    // (tydzień 1) → nieusuwalny, tylko toggle.
    {
      id: id('pp'),
      name: 'Rogoźno',
      address: 'Rogoźno',
      gpsLat: null,
      gpsLon: null,
      pickupDay: PICKUP_DAY,
      hoursFrom: '09:30',
      hoursTo: '10:30',
      extraCost: DELIVERY_COST.inne_punkty,
      isActive: false,
    },
  ];
  const [ppKakolewice, ppKomorniki, ppPuszczykowo, ppBaranowo, , ppRogozno] = pickupPoints;

  // ---------- Strefy dostawy (DATA_MODEL.md §13) ----------
  const deliveryZones: DeliveryZone[] = [
    {
      id: id('dz'),
      name: 'Strefa lokalna',
      localities: ['Chodzież', 'Margonin', 'Szamocin', 'Wągrowiec', 'Piła'],
      cost: DELIVERY_COST.home_delivery,
      isActive: true,
    },
    {
      id: id('dz'),
      name: 'Strefa Poznań okolice',
      localities: ['Komorniki', 'Puszczykowo'],
      cost: DELIVERY_COST.home_delivery,
      isActive: true,
    },
  ];

  // ---------- Produkty ----------
  const products: Product[] = PRODUCT_CATALOG.map((p) => ({
    id: id('prod'),
    name: p.name,
    category: p.category,
    unit: p.unit,
    availableMonths: p.availableMonths,
    isActive: true,
    photoUrl: null,
  }));

  // ---------- Użytkownicy ----------
  const mkUser = (
    firstName: string,
    lastName: string,
    role: User['role'],
    pickupPointId: string | null,
  ): User => ({
    id: id('user'),
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@greenleaf.test`,
    firstName,
    lastName,
    phone: null,
    role,
    defaultPickupPointId: pickupPointId,
    deliveryOption: 'pickup',
    deliveryAddress: null,
    notes: null,
    createdBy: 'admin',
    isActive: true,
    privacyAcceptedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  });

  // 2 adminów
  const magda = mkUser('Magda', 'Partyka', 'admin', null);
  const filip = mkUser('Filip', 'Partyka', 'admin', null);

  // 5 klientów (4 RWS + 1 zewnętrzny)
  const anna = mkUser('Anna', 'Nowak', 'klient_rws', ppKakolewice.id);
  const tomasz = mkUser('Tomasz', 'Kowalski', 'klient_rws', ppKomorniki.id);
  const ewa = mkUser('Ewa', 'Wisniewska', 'klient_rws', ppPuszczykowo.id);
  const piotr = mkUser('Piotr', 'Zielinski', 'klient_rws', ppBaranowo.id);
  const katarzyna = mkUser('Katarzyna', 'Lewandowska', 'klient_zewnetrzny', ppKakolewice.id);

  const users: User[] = [magda, filip, anna, tomasz, ewa, piotr, katarzyna];

  // ---------- Subskrypcje ----------
  const mkPackageSub = (
    user: User,
    type: 'paczka_24' | 'paczka_12',
    paymentModel: Subscription['paymentModel'],
  ): Subscription => {
    const deliveryCost = pickupPoints.find((p) => p.id === user.defaultPickupPointId)?.extraCost ?? 0;
    const totalPackages = PACKAGE_COUNT[type];
    const base = PACKAGE_PRICE[type];
    return {
      id: id('sub'),
      userId: user.id,
      type,
      season: seasonStr,
      frequency: 'weekly',
      eggQuantity: null,
      status: 'active',
      paymentModel,
      totalPackages,
      packagesRemaining: totalPackages,
      deliveryCostPerPackage: deliveryCost,
      totalAmount: base + deliveryCost * totalPackages,
      editedBy: null,
      createdAt: NOW,
      updatedAt: NOW,
    };
  };

  const mkEggSub = (user: User, eggQuantity: number): Subscription => ({
    id: id('sub'),
    userId: user.id,
    type: 'jajka_B',
    season: seasonStr,
    frequency: 'weekly',
    eggQuantity,
    status: 'active',
    paymentModel: 'upfront',
    totalPackages: 24,
    packagesRemaining: 24,
    deliveryCostPerPackage: 0,
    totalAmount: 0,
    editedBy: null,
    createdAt: NOW,
    updatedAt: NOW,
  });

  const subscriptions: Subscription[] = [
    mkPackageSub(anna, 'paczka_24', 'installments_3'),
    mkPackageSub(tomasz, 'paczka_12', 'installments_3'),
    mkEggSub(tomasz, 20), // część z jajkami
    mkPackageSub(ewa, 'paczka_24', 'upfront'),
    mkEggSub(ewa, 10), // część z jajkami
    mkPackageSub(piotr, 'paczka_12', 'upfront'),
  ];

  // ---------- WeeklyPackage (przykład — tydzień 4, czerwiec) ----------
  const weekNumber = 4;
  const pickupDate = `${SEASON}-06-13`; // sobota
  const weeklyPackage: WeeklyPackage = {
    id: id('wp'),
    weekNumber,
    pickupDate,
    publishedAt: `${SEASON}-06-09T10:00:00.000Z`, // wtorek
    swapDeadline: `${SEASON}-06-10T20:00:00.000Z`, // środa 20:00
    absenceDeadline: `${SEASON}-06-10T10:00:00.000Z`, // środa 10:00
    status: 'published',
    season: seasonStr,
    pickupPointIds: null,
    createdAt: NOW,
  };
  const weeklyPackages: WeeklyPackage[] = [weeklyPackage];

  // PackageItem: 11 sezonowych pozycji dostępnych w czerwcu (miesiąc 6).
  const juneProducts = productsAvailableInMonth(products, 6).slice(0, 11);
  const packageItems: PackageItem[] = juneProducts.map((prod) => ({
    id: id('pi'),
    weeklyPackageId: weeklyPackage.id,
    productId: prod.id,
    quantity: 1,
    unit: prod.unit,
  }));

  // ---------- ClientPackage dla aktywnych subskrypcji paczek ----------
  const activePackageSubs = subscriptions.filter(
    (s) => s.status === 'active' && (s.type === 'paczka_24' || s.type === 'paczka_12'),
  );
  const clientPackages: ClientPackage[] = activePackageSubs.map((sub) => {
    const owner = users.find((u) => u.id === sub.userId)!;
    return {
      id: id('cp'),
      weeklyPackageId: weeklyPackage.id,
      userId: sub.userId,
      subscriptionId: sub.id,
      status: 'pending',
      pickupPointId: owner.defaultPickupPointId,
      isHomeDelivery: false,
      absenceReported: false,
      absenceReportedAt: null,
      pickupConfirmedFarm: false,
      pickupConfirmedFarmAt: null,
      pickupConfirmedFarmBy: null,
      pickupConfirmedDriver: false,
      pickupConfirmedDriverAt: null,
      pickupConfirmedDriverBy: null,
      note: null,
      createdAt: NOW,
      updatedAt: NOW,
    };
  });

  // ---------- Archiwum: tygodnie 1–3 (zakończone) — do przeglądu historii w Odbiorach ----------
  // Stany per klient: 'picked' (odebrana), 'absence' (zgłosił brak), 'noshow' (nie odebrał, nie zgłosił).
  type ArchState = 'picked' | 'absence' | 'noshow';
  const ARCHIVAL_WEEKS: { weekNumber: number; pickupDate: string; states: ArchState[] }[] = [
    { weekNumber: 1, pickupDate: `${SEASON}-05-23`, states: ['picked', 'picked', 'picked', 'picked'] },
    { weekNumber: 2, pickupDate: `${SEASON}-05-30`, states: ['picked', 'picked', 'picked', 'absence'] },
    { weekNumber: 3, pickupDate: `${SEASON}-06-06`, states: ['picked', 'picked', 'absence', 'noshow'] },
  ];

  for (const spec of ARCHIVAL_WEEKS) {
    const month = Number(spec.pickupDate.slice(5, 7));
    const wp: WeeklyPackage = {
      id: id('wp'),
      weekNumber: spec.weekNumber,
      pickupDate: spec.pickupDate,
      publishedAt: weeklyDeadline(spec.pickupDate, { dayOfWeek: 2, hour: 10, minute: 0 }).toISOString(),
      swapDeadline: weeklyDeadline(spec.pickupDate, SWAP_DEADLINE).toISOString(),
      absenceDeadline: weeklyDeadline(spec.pickupDate, ABSENCE_DEADLINE).toISOString(),
      status: 'completed',
      season: seasonStr,
      pickupPointIds: null,
      createdAt: NOW,
    };
    weeklyPackages.push(wp);

    for (const prod of productsAvailableInMonth(products, month).slice(0, 10)) {
      packageItems.push({
        id: id('pi'),
        weeklyPackageId: wp.id,
        productId: prod.id,
        quantity: 1,
        unit: prod.unit,
      });
    }

    const pickupDayIso = `${spec.pickupDate}T10:00:00.000Z`;
    activePackageSubs.forEach((sub, i) => {
      const owner = users.find((u) => u.id === sub.userId)!;
      const state = spec.states[i] ?? 'picked';
      clientPackages.push({
        id: id('cp'),
        weeklyPackageId: wp.id,
        userId: sub.userId,
        subscriptionId: sub.id,
        status: state === 'picked' ? 'picked_up' : 'not_picked_up',
        pickupPointId: owner.defaultPickupPointId,
        isHomeDelivery: false,
        absenceReported: state === 'absence',
        absenceReportedAt: state === 'absence' ? wp.absenceDeadline : null,
        pickupConfirmedFarm: state === 'picked',
        pickupConfirmedFarmAt: state === 'picked' ? pickupDayIso : null,
        pickupConfirmedFarmBy: state === 'picked' ? magda.id : null,
        pickupConfirmedDriver: false,
        pickupConfirmedDriverAt: null,
        pickupConfirmedDriverBy: null,
        note: null,
        createdAt: NOW,
        updatedAt: pickupDayIso,
      });
    });
  }

  // Demo: odbiór Piotra w tygodniu 1 odbył się w Rogoźnie (punkt dziś wyłączony) —
  // dzięki temu archiwum pokazuje punkt spoza aktywnej puli, a Rogoźno jest nieusuwalne.
  {
    const week1 = weeklyPackages.find((w) => w.weekNumber === 1)!;
    const cpPiotr = clientPackages.find(
      (c) => c.weeklyPackageId === week1.id && c.userId === piotr.id,
    )!;
    cpPiotr.pickupPointId = ppRogozno.id;
  }

  // Licznik: packagesRemaining = totalPackages − faktycznie odebrane (spójność z archiwum).
  for (const sub of activePackageSubs) {
    const picked = clientPackages.filter(
      (c) => c.subscriptionId === sub.id && c.status === 'picked_up',
    ).length;
    sub.packagesRemaining = sub.totalPackages - picked;
  }

  return {
    users,
    subscriptions,
    weeklyPackages,
    packageItems,
    products,
    clientPackages,
    swaps: [],
    chickenReservations: [],
    extraOrders: [],
    extraOrderItems: [],
    payments: [],
    pickupPoints,
    deliveryZones,
    announcements: [],
    notifications: [],
    auditLogs: [],
  };
}
