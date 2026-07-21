import { describe, it, expect } from 'vitest';
import { createSeedData } from '@/lib/seed';
import { reserveChicken, reservationsForBatch, reservationsForUser, cancelReservation, chickenBatches } from '@/lib/chickens';
import { placeOrder, ordersForUser, allOrders, setOrderStatus, orderItems } from '@/lib/orders';

describe('chickens (F9)', () => {
  it('3 partie; zapis dodaje rezerwację; anulowanie usuwa', () => {
    const store = createSeedData();
    expect(chickenBatches()).toHaveLength(3);
    const u = store.users.find((x) => x.role === 'klient_rws')!;
    const r = reserveChicken(store, u.id, 'batch_1', 2, true);
    expect(reservationsForBatch(store, 'batch_1')).toHaveLength(1);
    expect(reservationsForUser(store, u.id)[0].carcassCount).toBe(2);
    cancelReservation(store, r.id);
    expect(reservationsForUser(store, u.id)).toHaveLength(0);
  });
  it('odrzuca liczbę tuszek <= 0', () => {
    const store = createSeedData();
    const u = store.users.find((x) => x.role === 'klient_rws')!;
    expect(() => reserveChicken(store, u.id, 'batch_1', 0, false)).toThrow();
  });
});

describe('extra orders (F10)', () => {
  it('złożenie zamówienia → status submitted; admin zatwierdza', () => {
    const store = createSeedData();
    const u = store.users.find((x) => x.role === 'klient_rws')!;
    const prod = store.products[0];
    const o = placeOrder(store, u.id, [{ productId: prod.id, quantity: 3 }]);
    expect(o.status).toBe('submitted');
    expect(orderItems(store, o.id)).toHaveLength(1);
    expect(ordersForUser(store, u.id)).toHaveLength(1);
    setOrderStatus(store, o.id, 'approved');
    expect(allOrders(store)[0].status).toBe('approved');
  });
  it('puste zamówienie odrzucone', () => {
    const store = createSeedData();
    const u = store.users.find((x) => x.role === 'klient_rws')!;
    expect(() => placeOrder(store, u.id, [{ productId: 'x', quantity: 0 }])).toThrow();
  });
});
