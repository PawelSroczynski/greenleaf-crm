import { describe, it, expect } from 'vitest';
import { createSeedData } from '@/lib/seed';

describe('seed danych', () => {
  const store = createSeedData();

  it('ma 4 punkty bazowe + 2 demo (Oborniki, Rogoźno)', () => {
    expect(store.pickupPoints).toHaveLength(6);
    expect(store.pickupPoints.some((p) => p.name === 'Oborniki')).toBe(true);
    expect(store.pickupPoints.some((p) => p.name === 'Rogoźno')).toBe(true);
  });

  it('punkt Kąkolewice ma extraCost 0, pozostałe 10', () => {
    const kakolewice = store.pickupPoints.find((p) => p.name.includes('Kąkolewice'));
    expect(kakolewice?.extraCost).toBe(0);
    const inne = store.pickupPoints.filter((p) => !p.name.includes('Kąkolewice'));
    expect(inne.every((p) => p.extraCost === 10)).toBe(true);
  });

  it('demo reguł usuwania: Oborniki usuwalne; Rogoźno wyłączone z historią (nieusuwalne)', () => {
    const oborniki = store.pickupPoints.find((p) => p.name === 'Oborniki')!;
    const rogozno = store.pickupPoints.find((p) => p.name === 'Rogoźno')!;

    // Oborniki: aktywny, zero klientów, zero historii → jedyny z przyciskiem usuń
    expect(oborniki.isActive).toBe(true);
    expect(store.users.some((u) => u.defaultPickupPointId === oborniki.id)).toBe(false);
    expect(store.clientPackages.some((c) => c.pickupPointId === oborniki.id)).toBe(false);

    // Rogoźno: wyłączony, zero obecnych klientów, ale odbiór w archiwum (tydzień 1)
    expect(rogozno.isActive).toBe(false);
    expect(store.users.some((u) => u.defaultPickupPointId === rogozno.id)).toBe(false);
    const week1 = store.weeklyPackages.find((w) => w.weekNumber === 1)!;
    expect(
      store.clientPackages.some(
        (c) => c.weeklyPackageId === week1.id && c.pickupPointId === rogozno.id,
      ),
    ).toBe(true);
  });

  it('ma 2 strefy dostawy', () => {
    expect(store.deliveryZones).toHaveLength(2);
  });

  it('ma ≥45 produktów', () => {
    expect(store.products.length).toBeGreaterThanOrEqual(45);
  });

  it('ma ≥2 adminów', () => {
    const admins = store.users.filter((u) => u.role === 'admin');
    expect(admins.length).toBeGreaterThanOrEqual(2);
  });

  it('ma ≥5 klientów', () => {
    const clients = store.users.filter(
      (u) => u.role === 'klient_rws' || u.role === 'klient_zewnetrzny',
    );
    expect(clients.length).toBeGreaterThanOrEqual(5);
  });

  it('subskrypcje przypisane do klientów RWS', () => {
    expect(store.subscriptions.length).toBeGreaterThan(0);
    const rwsIds = new Set(store.users.filter((u) => u.role === 'klient_rws').map((u) => u.id));
    expect(store.subscriptions.every((s) => rwsIds.has(s.userId))).toBe(true);
  });

  it('ma przykładową WeeklyPackage o statusie published', () => {
    expect(store.weeklyPackages.length).toBeGreaterThanOrEqual(1);
    expect(store.weeklyPackages.some((w) => w.status === 'published')).toBe(true);
  });

  it('przykładowa WeeklyPackage ma 10-12 PackageItem', () => {
    const wp = store.weeklyPackages[0];
    const items = store.packageItems.filter((i) => i.weeklyPackageId === wp.id);
    expect(items.length).toBeGreaterThanOrEqual(10);
    expect(items.length).toBeLessThanOrEqual(12);
  });

  it('wygenerowano ClientPackage dla aktywnych subskrypcji paczek (per tydzień)', () => {
    const activePackageSubs = store.subscriptions.filter(
      (s) => s.status === 'active' && (s.type === 'paczka_24' || s.type === 'paczka_12'),
    );
    // każdy tydzień (bieżący + archiwalne) ma komplet paczek klientów
    for (const wp of store.weeklyPackages) {
      const cps = store.clientPackages.filter((c) => c.weeklyPackageId === wp.id);
      expect(cps.length).toBe(activePackageSubs.length);
    }
    for (const cp of store.clientPackages) {
      expect(activePackageSubs.some((s) => s.id === cp.subscriptionId)).toBe(true);
    }
  });
});
