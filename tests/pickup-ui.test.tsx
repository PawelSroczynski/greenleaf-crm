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

    // liczymy tylko w tygodniu opublikowanym (bieżącym) — archiwum ma swoje odbiory
    const publishedId = loadStore().weeklyPackages.find((w) => w.status === 'published')!.id;
    const pickedNow = () =>
      loadStore().clientPackages.filter(
        (c) => c.weeklyPackageId === publishedId && c.status === 'picked_up',
      ).length;
    const before = pickedNow();
    expect(before).toBe(0);

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    const after = pickedNow();
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

describe('Odbiory — nawigator tygodni', () => {
  it('default = bieżący tydzień (4); strzałka wstecz pokazuje archiwum z no-show', async () => {
    const user = userEvent.setup();
    render(<PickupList />);

    // default: bieżący tydzień
    expect(screen.getByText(/Tydzień 4/)).toBeInTheDocument();
    expect(screen.getByText('bieżący tydzień')).toBeInTheDocument();
    // strzałka naprzód zablokowana (jesteśmy na najnowszym)
    expect(screen.getByLabelText('Następny tydzień')).toBeDisabled();

    // wstecz → tydzień 3 (archiwum: Ewa zgłosiła, Piotr no-show)
    await user.click(screen.getByLabelText('Poprzedni tydzień'));
    expect(screen.getByText(/Tydzień 3/)).toBeInTheDocument();
    expect(screen.getByText('archiwum sezonu')).toBeInTheDocument();
    expect(screen.getAllByText('Nie odebrał — bez zgłoszenia').length).toBeGreaterThanOrEqual(1);
  });

  it('edycja archiwum: odhaczenie no-show w tygodniu 3 zapisuje picked_up', async () => {
    const user = userEvent.setup();
    render(<PickupList />);
    await user.click(screen.getByLabelText('Poprzedni tydzień')); // tydzień 3

    const week3 = loadStore().weeklyPackages.find((w) => w.weekNumber === 3)!;
    const pickedIn3 = () =>
      loadStore().clientPackages.filter(
        (c) => c.weeklyPackageId === week3.id && c.status === 'picked_up',
      ).length;
    const before = pickedIn3();

    // odhacz no-show: niezaznaczony i AKTYWNY (zgłoszona nieobecność jest zablokowana)
    const boxes = (screen.getAllByRole('checkbox') as HTMLInputElement[]).filter(
      (b) => !b.checked && !b.disabled,
    );
    await user.click(boxes[0]);
    expect(pickedIn3()).toBe(before + 1);
  });
});

describe('Odbiory — zgłoszona nieobecność blokuje checkbox', () => {
  it('wiersz "Nie odbierze — zgłoszone" ma wyłączony checkbox', async () => {
    const user = userEvent.setup();
    render(<PickupList />);
    // tydzień 3 w archiwum ma zgłoszoną nieobecność (Ewa)
    await user.click(screen.getByLabelText('Poprzedni tydzień'));

    const week3 = loadStore().weeklyPackages.find((w) => w.weekNumber === 3)!;
    const absentCp = loadStore().clientPackages.find(
      (c) => c.weeklyPackageId === week3.id && c.absenceReported,
    )!;
    expect(absentCp).toBeDefined();

    const boxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    const disabled = boxes.filter((b) => b.disabled);
    expect(disabled).toHaveLength(1); // dokładnie jeden: zgłoszona nieobecność
    expect(disabled[0].checked).toBe(false);
  });
});
