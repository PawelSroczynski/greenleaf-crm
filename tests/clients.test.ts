import { describe, it, expect } from 'vitest';
import { createSeedData } from '@/lib/seed';
import {
  listClients,
  primarySubscription,
  setSubscriptionStatus,
  updateProfile,
} from '@/lib/clients';

describe('clients — logika (MVP-12 + profil)', () => {
  it('listClients zwraca klientów RWS + zewnętrznych z ich subskrypcjami', () => {
    const store = createSeedData();
    const rows = listClients(store);
    expect(rows.length).toBeGreaterThanOrEqual(5);
    expect(rows.every((r) => r.user.role === 'klient_rws' || r.user.role === 'klient_zewnetrzny')).toBe(true);
    // co najmniej jeden klient ma subskrypcję
    expect(rows.some((r) => r.subscriptions.length > 0)).toBe(true);
  });

  it('primarySubscription preferuje subskrypcję paczkową', () => {
    const store = createSeedData();
    const rws = store.users.find((u) => u.role === 'klient_rws')!;
    const sub = primarySubscription(store, rws.id);
    expect(sub).toBeDefined();
    expect(['paczka_24', 'paczka_12']).toContain(sub!.type);
  });

  it('setSubscriptionStatus pauzuje i wznawia', () => {
    const store = createSeedData();
    const sub = store.subscriptions.find((s) => s.status === 'active')!;
    setSubscriptionStatus(store, sub.id, 'paused');
    expect(sub.status).toBe('paused');
    setSubscriptionStatus(store, sub.id, 'active');
    expect(sub.status).toBe('active');
  });

  it('updateProfile zmienia punkt odbioru i sposób dostawy', () => {
    const store = createSeedData();
    const user = store.users.find((u) => u.role === 'klient_rws')!;
    const point = store.pickupPoints[1];
    updateProfile(store, user.id, { defaultPickupPointId: point.id, deliveryOption: 'home_delivery' });
    expect(user.defaultPickupPointId).toBe(point.id);
    expect(user.deliveryOption).toBe('home_delivery');
  });
});
