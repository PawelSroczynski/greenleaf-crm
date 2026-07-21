// lib/orders.ts — zamówienia dodatkowe poza paczką (F10).
// Admin udostępnia produkty do domówienia; klient zamawia; admin zatwierdza/odrzuca.

import type { ExtraOrder, ExtraOrderItem, Product, Store } from './types';

let _seq = 0;
function genId(prefix: string): string {
  _seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${_seq.toString(36)}`;
}

/** Produkty dostępne do domówienia (admin oznacza `isActive`; tu = wszystkie aktywne). */
export function availableExtras(store: Store): Product[] {
  return store.products.filter((p) => p.isActive);
}

/** Klient składa zamówienie dodatkowe (pozycje: produkt + ilość). Status 'submitted'. */
export function placeOrder(
  store: Store,
  userId: string,
  lines: { productId: string; quantity: number }[],
  now: string = new Date().toISOString(),
): ExtraOrder {
  const clean = lines.filter((l) => Number.isFinite(l.quantity) && l.quantity > 0);
  if (clean.length === 0) throw new Error('Zamówienie musi mieć co najmniej jedną pozycję.');
  const owner = store.users.find((u) => u.id === userId);
  const order: ExtraOrder = {
    id: genId('eo'),
    userId,
    status: 'submitted',
    approvedBy: null,
    adminNote: null,
    pickupPointId: owner?.defaultPickupPointId ?? null,
    submittedAt: now,
    approvedAt: null,
    createdAt: now,
  };
  store.extraOrders.push(order);
  for (const l of clean) {
    const product = store.products.find((p) => p.id === l.productId);
    const item: ExtraOrderItem = {
      id: genId('eoi'),
      extraOrderId: order.id,
      productId: l.productId,
      quantity: l.quantity,
      unitPrice: 0,
      unit: product?.unit ?? 'szt',
    };
    store.extraOrderItems.push(item);
  }
  return order;
}

export function orderItems(store: Store, orderId: string): ExtraOrderItem[] {
  return store.extraOrderItems.filter((i) => i.extraOrderId === orderId);
}

export function ordersForUser(store: Store, userId: string): ExtraOrder[] {
  return store.extraOrders
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function allOrders(store: Store): ExtraOrder[] {
  return [...store.extraOrders].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function setOrderStatus(
  store: Store,
  orderId: string,
  status: 'approved' | 'rejected',
  by = 'admin',
): void {
  const o = store.extraOrders.find((x) => x.id === orderId);
  if (!o) throw new Error(`Brak zamówienia o id ${orderId}.`);
  o.status = status;
  o.approvedBy = by;
  o.approvedAt = new Date().toISOString();
}
