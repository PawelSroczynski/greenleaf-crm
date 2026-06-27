import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientsList } from '@/components/admin/ClientsList';
import { ProfilePanel } from '@/components/client/ProfilePanel';
import { loadStore } from '@/lib/store';
import { findCurrentClient } from '@/lib/pickups';
import i18n from '@/lib/i18n';

describe('ETAP 7 — Klienci + Profil (UI)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('pl');
  });

  it('Klienci: lista renderuje klientów, klik otwiera szczegół', async () => {
    const user = userEvent.setup();
    render(<ClientsList />);
    const rows = loadStore().users.filter(
      (u) => u.role === 'klient_rws' || u.role === 'klient_zewnetrzny',
    );
    expect(rows.length).toBeGreaterThan(0);

    // klik w pierwszego klienta → widok szczegółu (przycisk Wstecz)
    const first = rows.sort((a, b) => a.lastName.localeCompare(b.lastName))[0];
    await user.click(screen.getByText(new RegExp(`${first.firstName} ${first.lastName}`)));
    expect(screen.getByText('Subskrypcje')).toBeInTheDocument();
  });

  it('Klienci: przycisk Wstrzymaj pauzuje subskrypcję w store', async () => {
    const user = userEvent.setup();
    render(<ClientsList />);

    // wejdź w klienta który ma aktywną subskrypcję paczkową
    const store = loadStore();
    const sub = store.subscriptions.find((s) => s.status === 'active')!;
    const owner = store.users.find((u) => u.id === sub.userId)!;
    await user.click(screen.getByText(new RegExp(`${owner.firstName} ${owner.lastName}`)));

    await user.click(screen.getAllByRole('button', { name: 'Wstrzymaj' })[0]);
    const after = loadStore().subscriptions.find((s) => s.id === sub.id)!;
    expect(after.status).toBe('paused');
  });

  it('Profil: zmiana punktu odbioru zapisuje do store', async () => {
    const user = userEvent.setup();
    render(<ProfilePanel />);

    const before = findCurrentClient(loadStore())!;
    const points = loadStore().pickupPoints.filter((p) => p.isActive);
    const other = points.find((p) => p.id !== before.user!.defaultPickupPointId)!;

    await user.selectOptions(screen.getAllByRole('combobox')[0], other.id);
    await user.click(screen.getByRole('button', { name: 'Zapisz' }));

    const after = findCurrentClient(loadStore())!;
    expect(after.user!.defaultPickupPointId).toBe(other.id);
  });
});
