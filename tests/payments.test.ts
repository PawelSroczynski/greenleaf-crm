import { describe, it, expect } from 'vitest';
import { createSeedData } from '@/lib/seed';
import { paymentPlan, markPaid, unmarkPaid, isFullyPaid } from '@/lib/payments';

describe('payments — oznaczanie zapłacone (F8)', () => {
  it('installments_3 → 3 raty z datami; markPaid oznacza jedną', () => {
    const store = createSeedData();
    const sub = store.subscriptions.find((s) => s.paymentModel === 'installments_3')!;
    const plan = paymentPlan(sub);
    expect(plan).toHaveLength(3);
    expect(plan[0].dueDate).toBe('2026-05-10');
    markPaid(store, sub.id, 1);
    expect(paymentPlan(sub)[0].paid).toBe(true);
    expect(isFullyPaid(sub)).toBe(false);
  });

  it('upfront → 1 pozycja (całość); zaznaczenie = w pełni opłacone', () => {
    const store = createSeedData();
    const sub = store.subscriptions.find((s) => s.paymentModel === 'upfront')!;
    expect(paymentPlan(sub)).toHaveLength(1);
    markPaid(store, sub.id, 0);
    expect(isFullyPaid(sub)).toBe(true);
    unmarkPaid(store, sub.id, 0);
    expect(isFullyPaid(sub)).toBe(false);
  });
});
