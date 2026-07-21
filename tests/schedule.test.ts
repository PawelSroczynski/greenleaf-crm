import { describe, it, expect } from 'vitest';
import { pickupDates, scheduleFor } from '@/lib/schedule';
import { requestDateChange, sendMessage, inbox, unreadCount, markRequestRead } from '@/lib/inbox';
import { createSeedData } from '@/lib/seed';

describe('schedule — harmonogram odbiorów (F4)', () => {
  it('weekly: 24 sobót co 7 dni od 2026-05-23', () => {
    const d = pickupDates({ frequency: 'weekly', totalPackages: 24 });
    expect(d).toHaveLength(24);
    expect(d[0]).toBe('2026-05-23');
    expect(d[1]).toBe('2026-05-30');
  });

  it('biweekly: 12 sobót co 14 dni', () => {
    const d = pickupDates({ frequency: 'biweekly', totalPackages: 12 });
    expect(d).toHaveLength(12);
    expect(d[0]).toBe('2026-05-23');
    expect(d[1]).toBe('2026-06-06');
  });

  it('scheduleFor oznacza odebrane i najbliższą paczkę', () => {
    const s = scheduleFor({ frequency: 'weekly', totalPackages: 24, packagesRemaining: 21 });
    expect(s.filter((e) => e.delivered)).toHaveLength(3);
    expect(s.find((e) => e.isNext)?.index).toBe(3);
  });
});

describe('inbox — skrzynka admina (F4/F11)', () => {
  it('requestDateChange trafia do skrzynki jako nieprzeczytane', () => {
    const store = createSeedData();
    const u = store.users.find((x) => x.role === 'klient_rws')!;
    requestDateChange(store, u.id, '2026-06-13', '2026-06-20', '2026-07-01T10:00:00Z');
    expect(inbox(store)).toHaveLength(1);
    expect(unreadCount(store)).toBe(1);
    expect(inbox(store)[0].kind).toBe('date_change');
  });

  it('sendMessage odrzuca pustą treść', () => {
    const store = createSeedData();
    const u = store.users.find((x) => x.role === 'klient_rws')!;
    expect(() => sendMessage(store, u.id, '   ')).toThrow();
    sendMessage(store, u.id, 'Dzień dobry, pytanie o paczkę', '2026-07-01T11:00:00Z');
    expect(unreadCount(store)).toBe(1);
  });

  it('markRequestRead zeruje licznik nieprzeczytanych', () => {
    const store = createSeedData();
    const u = store.users.find((x) => x.role === 'klient_rws')!;
    const r = sendMessage(store, u.id, 'test', '2026-07-01T12:00:00Z');
    markRequestRead(store, r.id);
    expect(unreadCount(store)).toBe(0);
  });
});
