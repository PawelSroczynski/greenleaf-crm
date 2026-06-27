import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminShell } from '@/components/AdminShell';
import { RoleProvider } from '@/lib/role-context';
import i18n from '@/lib/i18n';

// Seed: paczka tygodnia 4 odbiera się 2026-06-13 → kolejny szkic to czerwiec (miesiąc 6),
// więc lista sezonowa NIE zawiera pomidora (dostępny dopiero od lipca).

async function openWeeklyPackage() {
  const user = userEvent.setup();
  render(
    <RoleProvider>
      <AdminShell />
    </RoleProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Paczka tygodnia' }));
  return user;
}

describe('PackageBuilder — sekcja "Paczka tygodnia" w AdminShell', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('pl');
  });

  it('pokazuje builder z selektorem produktu i przyciskiem publikacji', async () => {
    await openWeeklyPackage();
    expect(screen.getByLabelText('Produkt')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publikuj paczkę' })).toBeInTheDocument();
  });

  it('lista wyboru NIE zawiera produktu spoza sezonu (pomidor w czerwcu)', async () => {
    await openWeeklyPackage();
    const select = screen.getByLabelText('Produkt');
    // produkt sezonowy obecny
    expect(within(select).getByRole('option', { name: 'Sałata masłowa' })).toBeInTheDocument();
    // pomidor poza sezonem — brak na liście
    expect(within(select).queryByRole('option', { name: 'Pomidor' })).not.toBeInTheDocument();
  });

  it('dodanie produktu zwiększa draft, a publikacja pokazuje potwierdzenie', async () => {
    const user = await openWeeklyPackage();

    const select = screen.getByLabelText('Produkt');
    await user.selectOptions(select, within(select).getByRole('option', { name: 'Sałata masłowa' }));
    await user.click(screen.getByRole('button', { name: 'Dodaj' }));

    // pozycja widoczna na liście draftu (tekst z myślnikiem, nie sama opcja selecta)
    expect(screen.getByText(/Sałata masłowa —/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Publikuj paczkę' }));

    // potwierdzenie publikacji + informacja o wygenerowanych paczkach (4 aktywne subskrypcje)
    expect(screen.getByText('Paczka opublikowana')).toBeInTheDocument();
    expect(screen.getByText(/4 aktywnych subskrypcji/)).toBeInTheDocument();
  });
});
