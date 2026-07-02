import { describe, it, expect } from 'vitest';
import { createSeedData } from '@/lib/seed';
import {
  addPickupPoint,
  setPickupPointActive,
  removePickupPoint,
  clientsAtPoint,
} from '@/lib/points';

describe('points — zarządzanie pulą punktów odbioru (admin)', () => {
  it('addPickupPoint dodaje aktywny punkt z kosztem i godzinami', () => {
    const store = createSeedData();
    const before = store.pickupPoints.length;
    const p = addPickupPoint(store, { name: 'Oborniki', extraCost: 10, hoursFrom: '09:00', hoursTo: '10:30' });
    expect(store.pickupPoints.length).toBe(before + 1);
    expect(p.isActive).toBe(true);
    expect(p.pickupDay).toBe('saturday');
  });

  it('addPickupPoint odrzuca pustą nazwę i duplikat', () => {
    const store = createSeedData();
    expect(() => addPickupPoint(store, { name: '  ', extraCost: 0, hoursFrom: '09:00', hoursTo: '10:00' })).toThrow();
    expect(() => addPickupPoint(store, { name: 'Komorniki', extraCost: 0, hoursFrom: '09:00', hoursTo: '10:00' })).toThrow();
  });

  it('setPickupPointActive wyłącza i włącza punkt', () => {
    const store = createSeedData();
    const p = store.pickupPoints[1];
    setPickupPointActive(store, p.id, false);
    expect(p.isActive).toBe(false);
    setPickupPointActive(store, p.id, true);
    expect(p.isActive).toBe(true);
  });

  it('removePickupPoint usuwa punkt bez klientów; z klientami odrzuca', () => {
    const store = createSeedData();
    // punkt z klientami (Kąkolewice — Anna i Katarzyna) → odrzucone
    const used = store.pickupPoints[0];
    expect(clientsAtPoint(store, used.id).length).toBeGreaterThan(0);
    expect(() => removePickupPoint(store, used.id)).toThrow();

    // świeżo dodany, bez klientów → usunięty
    const fresh = addPickupPoint(store, { name: 'Testowo', extraCost: 10, hoursFrom: '09:00', hoursTo: '10:00' });
    removePickupPoint(store, fresh.id);
    expect(store.pickupPoints.some((x) => x.id === fresh.id)).toBe(false);
  });
});
