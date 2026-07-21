import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminShell } from '@/components/AdminShell';
import { RoleProvider } from '@/lib/role-context';
import { loadStore } from '@/lib/store';
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
  await user.click(screen.getByRole('button', { name: 'Paczka' }));
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

describe('PackageBuilder — punkty odbioru tygodnia', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('pl');
  });

  it('pokazuje 4 punkty (wszystkie zaznaczone); odznaczenie jednego ogranicza publikację', async () => {
    const user = await openWeeklyPackage();

    // 4 checkboxy punktów, wszystkie domyślnie zaznaczone
    const pointBoxes = ['Kąkolewice 17a', 'Komorniki', 'Puszczykowo', 'Baranowo, ul. Alabastrowa'].map(
      (n) => screen.getByLabelText(n) as HTMLInputElement,
    );
    expect(pointBoxes.every((b) => b.checked)).toBe(true);

    // dodaj pozycję i odznacz Puszczykowo (Ewa)
    await user.selectOptions(
      screen.getByLabelText('Produkt'),
      screen.getByRole('option', { name: 'Ogórek gruntowy' }),
    );
    await user.click(screen.getByRole('button', { name: 'Dodaj' }));
    await user.click(screen.getByLabelText('Puszczykowo'));
    await user.click(screen.getByRole('button', { name: 'Publikuj paczkę' }));

    // wygenerowano 3 paczki (bez Ewy z Puszczykowa)
    const store = loadStore();
    const newWp = store.weeklyPackages.find((w) => w.weekNumber === 5)!;
    const cps = store.clientPackages.filter((c) => c.weeklyPackageId === newWp.id);
    expect(cps).toHaveLength(3);
    const ewa = store.users.find((u) => u.firstName === 'Ewa')!;
    expect(cps.some((c) => c.userId === ewa.id)).toBe(false);
  });
});

describe('PackageBuilder — definiowanie zamienników (F2)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('pl');
  });

  it('dodanie produktu, Opcje → zaznaczenie zamiennika zapisuje substituteIds', async () => {
    const user = await openWeeklyPackage();
    await user.selectOptions(
      screen.getByLabelText('Produkt'),
      screen.getByRole('option', { name: 'Ogórek gruntowy' }),
    );
    await user.click(screen.getByRole('button', { name: 'Dodaj' }));
    await user.click(screen.getByRole('button', { name: 'Opcje' }));

    // „Sałata masłowa" pojawia się w sekcji zamienników i „do wyboru"; [0] = zamienniki
    const salata = loadStore().products.find((p) => p.name === 'Sałata masłowa')!;
    await user.click(screen.getAllByLabelText('Sałata masłowa')[0]);

    const draft = loadStore().weeklyPackages.find((w) => w.status === 'draft')!;
    const item = loadStore().packageItems.find((i) => i.weeklyPackageId === draft.id)!;
    expect(item.substituteIds).toContain(salata.id);
  });
});
