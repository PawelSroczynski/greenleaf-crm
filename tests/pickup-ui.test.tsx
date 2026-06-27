import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionPanel } from '@/components/client/SubscriptionPanel';
import { PackageStatus } from '@/components/client/PackageStatus';
import { PickupList } from '@/components/admin/PickupList';
import { loadStore } from '@/lib/store';
import { findCurrentClient } from '@/lib/pickups';
import i18n from '@/lib/i18n';

describe('ETAP 4 — domknięcie cyklu (UI)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('pl');
  });

  it('Abonament: pokazuje licznik X/24', () => {
    render(<SubscriptionPanel />);
    expect(screen.getByText('Typ abonamentu')).toBeInTheDocument();
    expect(screen.getByText(/\/24/)).toBeInTheDocument(); // licznik delivered/24
  });

  it('Odbiory (admin): checkbox „odebrano" ustawia status picked_up', async () => {
    const user = userEvent.setup();
    render(<PickupList />);

    const before = loadStore().clientPackages.filter((c) => c.status === 'picked_up').length;
    expect(before).toBe(0);

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    const after = loadStore().clientPackages.filter((c) => c.status === 'picked_up').length;
    expect(after).toBe(1);
  });

  it('„Nie odbiorę" przed terminem ustawia zgłoszenie', async () => {
    const user = userEvent.setup();
    render(<PackageStatus />);
    await user.click(screen.getByRole('button', { name: 'Nie odbiorę w tym tygodniu' }));
    const cur = findCurrentClient(loadStore())!;
    expect(cur.cp.absenceReported).toBe(true);
  });

  it('Po terminie: zgłoszenie zablokowane (komunikat zamiast przycisku)', async () => {
    const user = userEvent.setup();
    render(<PackageStatus />);
    await user.click(screen.getByLabelText('Symuluj: po terminie (środa 10:00)'));
    expect(
      screen.getByText('Termin zgłaszania braku minął (środa 10:00).'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Nie odbiorę w tym tygodniu' }),
    ).not.toBeInTheDocument();
  });
});
