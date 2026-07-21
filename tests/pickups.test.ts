import { describe, it, expect } from 'vitest';
import { createSeedData } from '@/lib/seed';
import {
  getAbsenceDeadline,
  isAbsenceOpen,
  reportAbsence,
  cancelAbsence,
  markPickedUp,
  pickupStatusList,
  notPickedNotReported,
} from '@/lib/pickups';

function publishedPkg(store = createSeedData()) {
  const wp = store.weeklyPackages.find((w) => w.status === 'published')!;
  return { store, wp };
}

describe('pickups — deadline braku odbioru (MVP-5)', () => {
  it('isAbsenceOpen: przed terminem true, po terminie false', () => {
    const { wp } = publishedPkg();
    const deadline = getAbsenceDeadline(wp);
    const before = new Date(deadline.getTime() - 60_000);
    const after = new Date(deadline.getTime() + 60_000);
    expect(isAbsenceOpen(wp, before)).toBe(true);
    expect(isAbsenceOpen(wp, after)).toBe(false);
  });

  it('deadline to środa 20:00 (UTC)', () => {
    const { wp } = publishedPkg();
    const d = getAbsenceDeadline(wp);
    expect(d.getUTCDay()).toBe(3); // środa
    expect(d.getUTCHours()).toBe(20);
    expect(d.getUTCMinutes()).toBe(0);
  });

  it('reportAbsence przed terminem ustawia flagę; cancelAbsence cofa', () => {
    const { store, wp } = publishedPkg();
    const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id)!;
    const before = new Date(getAbsenceDeadline(wp).getTime() - 60_000);

    reportAbsence(store, cp.id, before);
    expect(cp.absenceReported).toBe(true);
    expect(cp.absenceReportedAt).not.toBeNull();

    cancelAbsence(store, cp.id, before);
    expect(cp.absenceReported).toBe(false);
    expect(cp.absenceReportedAt).toBeNull();
  });

  it('reportAbsence po terminie rzuca', () => {
    const { store, wp } = publishedPkg();
    const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id)!;
    const after = new Date(getAbsenceDeadline(wp).getTime() + 60_000);
    expect(() => reportAbsence(store, cp.id, after)).toThrow();
  });
});

describe('pickups — potwierdzenie odbioru (MVP-13) + licznik (MVP-7)', () => {
  it('markPickedUp ustawia status i zmniejsza packagesRemaining o 1', () => {
    const { store, wp } = publishedPkg();
    const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id)!;
    const sub = store.subscriptions.find((s) => s.id === cp.subscriptionId)!;
    const before = sub.packagesRemaining;

    markPickedUp(store, cp.id, 'admin-magda');
    expect(cp.status).toBe('picked_up');
    expect(cp.pickupConfirmedFarm).toBe(true);
    expect(sub.packagesRemaining).toBe(before - 1);
  });

  it('markPickedUp jest idempotentne — drugi raz nie odejmuje ponownie', () => {
    const { store, wp } = publishedPkg();
    const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id)!;
    const sub = store.subscriptions.find((s) => s.id === cp.subscriptionId)!;
    const before = sub.packagesRemaining;

    markPickedUp(store, cp.id, 'admin');
    markPickedUp(store, cp.id, 'admin');
    expect(sub.packagesRemaining).toBe(before - 1);
  });
});

describe('pickups — listy dla admina', () => {
  it('pickupStatusList zwraca wiersze z danymi klienta', () => {
    const { store, wp } = publishedPkg();
    const rows = pickupStatusList(store, wp.id);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].user).toBeDefined();
  });

  it('notPickedNotReported: tylko klient bez odbioru i bez zgłoszenia', () => {
    const { store, wp } = publishedPkg();
    const cps = store.clientPackages.filter((c) => c.weeklyPackageId === wp.id);
    expect(cps.length).toBeGreaterThanOrEqual(3);

    // scenariusz: cps[0] odebrał, cps[1] zgłosił brak, cps[2..] nic
    markPickedUp(store, cps[0].id, 'admin');
    const before = new Date(getAbsenceDeadline(wp).getTime() - 60_000);
    reportAbsence(store, cps[1].id, before);

    const flagged = notPickedNotReported(store, wp.id);
    const ids = flagged.map((c) => c.id);
    expect(ids).not.toContain(cps[0].id);
    expect(ids).not.toContain(cps[1].id);
    expect(ids).toContain(cps[2].id);
  });
});

describe('pickups — cofnięcie odbioru (misklik checkboxa)', () => {
  it('undoPickedUp przywraca status pending i oddaje packagesRemaining', async () => {
    const { undoPickedUp } = await import('@/lib/pickups');
    const store = createSeedData();
    const wp = store.weeklyPackages.find((w) => w.status === 'published')!;
    const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id)!;
    const sub = store.subscriptions.find((s) => s.id === cp.subscriptionId)!;
    const before = sub.packagesRemaining;

    markPickedUp(store, cp.id, 'admin');
    expect(sub.packagesRemaining).toBe(before - 1);

    undoPickedUp(store, cp.id);
    expect(cp.status).toBe('pending');
    expect(cp.pickupConfirmedFarm).toBe(false);
    expect(cp.pickupConfirmedFarmAt).toBeNull();
    expect(sub.packagesRemaining).toBe(before); // licznik oddany
  });

  it('undoPickedUp jest idempotentne — na nieodebranej paczce nic nie zmienia', async () => {
    const { undoPickedUp } = await import('@/lib/pickups');
    const store = createSeedData();
    const wp = store.weeklyPackages.find((w) => w.status === 'published')!;
    const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id)!;
    const sub = store.subscriptions.find((s) => s.id === cp.subscriptionId)!;
    const before = sub.packagesRemaining;

    undoPickedUp(store, cp.id); // nic nie odebrano
    expect(sub.packagesRemaining).toBe(before); // licznik NIE rośnie ponad stan
    expect(cp.status).toBe('pending');
  });

  it('mark → undo → mark: licznik spójny (bez podwójnego odejmowania)', async () => {
    const { undoPickedUp } = await import('@/lib/pickups');
    const store = createSeedData();
    const wp = store.weeklyPackages.find((w) => w.status === 'published')!;
    const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id)!;
    const sub = store.subscriptions.find((s) => s.id === cp.subscriptionId)!;
    const before = sub.packagesRemaining;

    markPickedUp(store, cp.id, 'admin');
    undoPickedUp(store, cp.id);
    markPickedUp(store, cp.id, 'admin');
    expect(sub.packagesRemaining).toBe(before - 1);
  });
});

describe('pickups — przegląd tygodni (nawigator + archiwum)', () => {
  it('pickupWeeks zwraca tygodnie bez szkiców, posortowane rosnąco', async () => {
    const { pickupWeeks } = await import('@/lib/pickups');
    const store = createSeedData();
    const weeks = pickupWeeks(store);
    expect(weeks.length).toBeGreaterThanOrEqual(4); // 3 archiwalne + bieżący
    expect(weeks.every((w) => w.status !== 'draft')).toBe(true);
    const nums = weeks.map((w) => w.weekNumber);
    expect(nums).toEqual([...nums].sort((a, b) => a - b));
  });

  it('currentPickupWeek = najnowszy opublikowany (tydzień 4)', async () => {
    const { currentPickupWeek } = await import('@/lib/pickups');
    const store = createSeedData();
    expect(currentPickupWeek(store)?.weekNumber).toBe(4);
  });

  it('archiwalne tygodnie mają ClientPackage z mieszanymi stanami', () => {
    const store = createSeedData();
    const archival = store.weeklyPackages.filter((w) => w.status === 'completed');
    expect(archival.length).toBeGreaterThanOrEqual(3);
    for (const wp of archival) {
      const cps = store.clientPackages.filter((c) => c.weeklyPackageId === wp.id);
      expect(cps.length).toBeGreaterThan(0);
    }
    // w archiwum istnieje i odebrana, i zgłoszona nieobecność
    const archIds = new Set(archival.map((w) => w.id));
    const archCps = store.clientPackages.filter((c) => archIds.has(c.weeklyPackageId));
    expect(archCps.some((c) => c.status === 'picked_up')).toBe(true);
    expect(archCps.some((c) => c.absenceReported)).toBe(true);
  });

  it('licznik packagesRemaining odzwierciedla odebrane archiwalne paczki', () => {
    const store = createSeedData();
    for (const sub of store.subscriptions.filter((s) => s.type.startsWith('paczka'))) {
      const picked = store.clientPackages.filter(
        (c) => c.subscriptionId === sub.id && c.status === 'picked_up',
      ).length;
      expect(sub.packagesRemaining).toBe(sub.totalPackages - picked);
    }
  });

  it('edycja archiwalnego tygodnia działa (markPickedUp na starej paczce)', () => {
    const store = createSeedData();
    const archival = store.weeklyPackages.find((w) => w.status === 'completed')!;
    const cp = store.clientPackages.find(
      (c) => c.weeklyPackageId === archival.id && c.status !== 'picked_up',
    );
    if (cp) {
      markPickedUp(store, cp.id, 'admin');
      expect(cp.status).toBe('picked_up');
    }
  });
});

describe('pickups — cofnięcie odbioru zależne od tygodnia', () => {
  it('undo w tygodniu ARCHIWALNYM daje not_picked_up (tydzień minął), nie pending', async () => {
    const { undoPickedUp } = await import('@/lib/pickups');
    const store = createSeedData();
    const archival = store.weeklyPackages.find((w) => w.status === 'completed')!;
    const cp = store.clientPackages.find(
      (c) => c.weeklyPackageId === archival.id && c.status === 'picked_up',
    )!;

    undoPickedUp(store, cp.id);
    expect(cp.status).toBe('not_picked_up');
  });

  it('undo w tygodniu BIEŻĄCYM (published) daje pending', async () => {
    const { undoPickedUp } = await import('@/lib/pickups');
    const store = createSeedData();
    const current = store.weeklyPackages.find((w) => w.status === 'published')!;
    const cp = store.clientPackages.find((c) => c.weeklyPackageId === current.id)!;

    markPickedUp(store, cp.id, 'admin');
    undoPickedUp(store, cp.id);
    expect(cp.status).toBe('pending');
  });
});

describe('pickups — statusy kompletacji (F6)', () => {
  it('setPackageStatus ustawia assembled/ready, pomija odebrane i zgłoszone', async () => {
    const { setPackageStatus } = await import('@/lib/pickups');
    const store = createSeedData();
    const wp = store.weeklyPackages.find((w) => w.status === 'published')!;
    const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id && c.kind !== 'eggs')!;
    setPackageStatus(store, cp.id, 'assembled');
    expect(cp.status).toBe('assembled');
    setPackageStatus(store, cp.id, 'ready');
    expect(cp.status).toBe('ready');

    markPickedUp(store, cp.id, 'admin');
    setPackageStatus(store, cp.id, 'assembled'); // odebrana → bez zmian
    expect(cp.status).toBe('picked_up');
  });

  it('bulkSetWeekStatus oznacza wszystkie nieodebrane paczki tygodnia', async () => {
    const { bulkSetWeekStatus } = await import('@/lib/pickups');
    const store = createSeedData();
    const wp = store.weeklyPackages.find((w) => w.status === 'published')!;
    const n = bulkSetWeekStatus(store, wp.id, 'ready');
    expect(n).toBeGreaterThanOrEqual(4);
    const pkgs = store.clientPackages.filter((c) => c.weeklyPackageId === wp.id && c.kind !== 'eggs');
    expect(pkgs.every((c) => c.status === 'ready')).toBe(true);
  });
});
