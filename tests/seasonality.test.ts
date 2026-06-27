import { describe, it, expect } from 'vitest';
import { createSeedData } from '@/lib/seed';
import { isProductAvailable, productsAvailableInMonth } from '@/lib/seed';

describe('sezonowość produktów', () => {
  const store = createSeedData();

  it('pomidor NIE jest dostępny w maju (miesiąc 5)', () => {
    const tomato = store.products.find((p) => p.name.toLowerCase() === 'pomidor');
    expect(tomato).toBeDefined();
    expect(isProductAvailable(tomato!, 5)).toBe(false);
  });

  it('pomidor JEST dostępny w lipcu (miesiąc 7)', () => {
    const tomato = store.products.find((p) => p.name.toLowerCase() === 'pomidor');
    expect(isProductAvailable(tomato!, 7)).toBe(true);
  });

  it('w czerwcu (miesiąc 6) dostępnych jest ≥19 produktów', () => {
    const available = productsAvailableInMonth(store.products, 6);
    expect(available.length).toBeGreaterThanOrEqual(19);
  });

  it('rzodkiewka jest dostępna wcześnie (maj — miesiąc 5)', () => {
    const radish = store.products.find((p) => p.name.toLowerCase().includes('rzodkiewka'));
    expect(radish).toBeDefined();
    expect(isProductAvailable(radish!, 5)).toBe(true);
  });

  it('dynia jest dostępna późno (październik — miesiąc 10), nie wcześnie (maj)', () => {
    const pumpkin = store.products.find((p) => p.name.toLowerCase().includes('dynia'));
    expect(pumpkin).toBeDefined();
    expect(isProductAvailable(pumpkin!, 10)).toBe(true);
    expect(isProductAvailable(pumpkin!, 5)).toBe(false);
  });
});
