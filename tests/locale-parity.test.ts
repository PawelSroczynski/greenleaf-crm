import { describe, it, expect } from 'vitest';
import pl from '@/locales/pl.json';
import en from '@/locales/en.json';

// Spłaszcza zagnieżdżony obiekt tłumaczeń do zbioru ścieżek-kluczy (np. "admin.nav.dashboard").
function keyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v !== null && typeof v === 'object'
      ? keyPaths(v as Record<string, unknown>, path)
      : [path];
  });
}

describe('locale parity: pl.json === en.json (zbiór kluczy)', () => {
  const plKeys = keyPaths(pl as Record<string, unknown>).sort();
  const enKeys = keyPaths(en as Record<string, unknown>).sort();

  it('en.json nie ma brakujących kluczy względem pl.json', () => {
    const missing = plKeys.filter((k) => !enKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it('en.json nie ma nadmiarowych kluczy względem pl.json', () => {
    const extra = enKeys.filter((k) => !plKeys.includes(k));
    expect(extra).toEqual([]);
  });

  it('zbiory kluczy są identyczne', () => {
    expect(enKeys).toEqual(plKeys);
  });
});
