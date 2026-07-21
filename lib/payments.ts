// lib/payments.ts — ewidencja płatności (F8): oznaczanie „zapłacone" (całość lub rata).
// Bez systemu płatności — tylko flaga, tak jak prosiła Magda.

import { INSTALLMENT_DATES } from './config';
import type { Store, Subscription } from './types';

export interface PaymentLine {
  installment: number; // 0 = całość (upfront), 1..3 = raty
  label: string;
  dueDate: string | null;
  amount: number;
  paid: boolean;
}

/** Plan płatności subskrypcji: upfront = 1 pozycja (całość), installments_3 = 3 raty z datami. */
export function paymentPlan(sub: Subscription): PaymentLine[] {
  const paid = new Set(sub.paidInstallments ?? []);
  if (sub.paymentModel === 'installments_3') {
    return [1, 2, 3].map((n) => ({
      installment: n,
      label: `Rata ${n}`,
      dueDate: INSTALLMENT_DATES[n - 1] ?? null,
      amount: Math.round((sub.totalAmount / 3) * 100) / 100,
      paid: paid.has(n),
    }));
  }
  return [
    {
      installment: 0,
      label: 'Całość (z góry)',
      dueDate: null,
      amount: sub.totalAmount,
      paid: paid.has(0),
    },
  ];
}

function setPaid(store: Store, subId: string, installment: number, paid: boolean): void {
  const sub = store.subscriptions.find((s) => s.id === subId);
  if (!sub) throw new Error(`Brak subskrypcji o id ${subId}.`);
  const cur = new Set(sub.paidInstallments ?? []);
  if (paid) cur.add(installment);
  else cur.delete(installment);
  sub.paidInstallments = [...cur].sort((a, b) => a - b);
  sub.updatedAt = new Date().toISOString();
}

export function markPaid(store: Store, subId: string, installment: number): void {
  setPaid(store, subId, installment, true);
}
export function unmarkPaid(store: Store, subId: string, installment: number): void {
  setPaid(store, subId, installment, false);
}

/** Czy subskrypcja jest w pełni opłacona. */
export function isFullyPaid(sub: Subscription): boolean {
  return paymentPlan(sub).every((l) => l.paid);
}
