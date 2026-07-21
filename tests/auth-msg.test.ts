import { describe, it, expect } from 'vitest';
import { createSeedData } from '@/lib/seed';
import { setCredentials, authenticate, hasCredentials } from '@/lib/auth';
import { sendMessage, inbox } from '@/lib/inbox';

describe('auth — symulacja logowania (F12)', () => {
  it('seed: Anna ma demo login; authenticate zwraca użytkownika', () => {
    const store = createSeedData();
    const anna = store.users.find((u) => u.firstName === 'Anna')!;
    expect(hasCredentials(anna)).toBe(true);
    expect(authenticate(store, 'anna', 'anna123')?.id).toBe(anna.id);
    expect(authenticate(store, 'anna', 'złe')).toBeNull();
  });
  it('setCredentials nadaje login; odrzuca duplikat i pusty', () => {
    const store = createSeedData();
    const tomasz = store.users.find((u) => u.firstName === 'Tomasz')!;
    setCredentials(store, tomasz.id, 'tomek', 'haslo');
    expect(authenticate(store, 'tomek', 'haslo')?.id).toBe(tomasz.id);
    expect(() => setCredentials(store, tomasz.id, 'anna', 'x')).toThrow(); // zajęty
    expect(() => setCredentials(store, tomasz.id, '  ', 'x')).toThrow(); // pusty
  });
});

describe('komunikacja (F11)', () => {
  it('sendMessage trafia do skrzynki admina', () => {
    const store = createSeedData();
    const u = store.users.find((x) => x.role === 'klient_rws')!;
    sendMessage(store, u.id, 'Dzień dobry!', '2026-07-02T10:00:00Z');
    expect(inbox(store).some((r) => r.kind === 'message' && r.body === 'Dzień dobry!')).toBe(true);
  });
});

describe('auth — zalogowany widzi SWÓJ profil (F12 fix)', () => {
  it('findCurrentClient zwraca zalogowanego użytkownika, nie domyślnego', async () => {
    const { setLoggedInUser } = await import('@/lib/auth');
    const { findCurrentClient } = await import('@/lib/pickups');
    localStorage.clear();
    const store = createSeedData();

    // bez logowania → domyślny (Anna)
    setLoggedInUser(null);
    expect(findCurrentClient(store)?.user?.firstName).toBe('Anna');

    // zalogowany jako Tomasz → jego dane
    const tomasz = store.users.find((u) => u.firstName === 'Tomasz')!;
    setLoggedInUser(tomasz.id);
    expect(findCurrentClient(store)?.user?.id).toBe(tomasz.id);
    expect(findCurrentClient(store)?.user?.firstName).toBe('Tomasz');
  });
});
