import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SwapPanel } from '@/components/client/SwapPanel';
import { loadStore } from '@/lib/store';
import i18n from '@/lib/i18n';

// Bieżący klient (Anna) ma paczkę z 11 sezonowymi pozycjami czerwca.
// "Ogórek gruntowy" jest sezonowym zamiennikiem spoza paczki.

function storedSwaps() {
  return loadStore().swaps;
}

describe('SwapPanel — moduł zamian (MVP-4)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('pl');
  });

  it('Wariant A: lista z przyciskiem zapisuje Swap do store', async () => {
    const user = userEvent.setup();
    render(<SwapPanel />);

    // domyślnie wariant A, przed terminem (otwarte)
    expect(screen.getByText('Zamiany otwarte (termin: środa 20:00)')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Zamień' })[0]);
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, screen.getByRole('option', { name: 'Ogórek gruntowy' }));

    const swaps = storedSwaps();
    expect(swaps).toHaveLength(1);
    const ogorek = loadStore().products.find((p) => p.name === 'Ogórek gruntowy')!;
    expect(swaps[0].replacementProductId).toBe(ogorek.id);
  });

  it('Wariant B: formularz X→Y zapisuje Swap do store', async () => {
    const user = userEvent.setup();
    render(<SwapPanel />);

    await user.click(screen.getByRole('button', { name: 'Wariant B' }));
    await user.selectOptions(
      screen.getByLabelText('Produkt z paczki'),
      screen.getByRole('option', { name: 'Sałata masłowa' }),
    );
    await user.selectOptions(
      screen.getByLabelText('Zamiennik'),
      screen.getByRole('option', { name: 'Ogórek gruntowy' }),
    );
    await user.click(screen.getByRole('button', { name: 'Zamień' }));

    const swaps = storedSwaps();
    expect(swaps).toHaveLength(1);
    const store = loadStore();
    const salata = store.products.find((p) => p.name === 'Sałata masłowa')!;
    const ogorek = store.products.find((p) => p.name === 'Ogórek gruntowy')!;
    expect(swaps[0].originalProductId).toBe(salata.id);
    expect(swaps[0].replacementProductId).toBe(ogorek.id);
  });

  it('Wariant C: checkboxy + zbiorcze zatwierdzenie zapisuje Swap do store', async () => {
    const user = userEvent.setup();
    render(<SwapPanel />);

    await user.click(screen.getByRole('button', { name: 'Wariant C' }));
    await user.click(screen.getByLabelText('Sałata masłowa'));
    await user.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'Ogórek gruntowy' }),
    );
    await user.click(screen.getByRole('button', { name: 'Zatwierdź zamiany' }));

    const swaps = storedSwaps();
    expect(swaps).toHaveLength(1);
    const store = loadStore();
    const salata = store.products.find((p) => p.name === 'Sałata masłowa')!;
    expect(swaps[0].originalProductId).toBe(salata.id);
  });

  it('przełącznik wariantów A/B/C przełącza widoczne UI', async () => {
    const user = userEvent.setup();
    render(<SwapPanel />);

    // A: przyciski "Zamień" per pozycja
    expect(screen.getAllByRole('button', { name: 'Zamień' }).length).toBeGreaterThan(1);

    await user.click(screen.getByRole('button', { name: 'Wariant B' }));
    expect(screen.getByLabelText('Produkt z paczki')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Wariant C' }));
    expect(screen.getByRole('button', { name: 'Zatwierdź zamiany' })).toBeInTheDocument();
  });

  it('po terminie blokuje zamiany i pokazuje komunikat (każdy wariant)', async () => {
    const user = userEvent.setup();
    render(<SwapPanel />);

    await user.click(screen.getByLabelText('Symuluj: po terminie'));

    expect(screen.getByText('Zamiany zamknięte (termin: środa 20:00)')).toBeInTheDocument();
    // brak przycisków zamiany w wariancie A
    expect(screen.queryByRole('button', { name: 'Zamień' })).not.toBeInTheDocument();

    // wariant C: checkboxy zablokowane
    await user.click(screen.getByRole('button', { name: 'Wariant C' }));
    expect(screen.queryByRole('button', { name: 'Zatwierdź zamiany' })).not.toBeInTheDocument();
  });
});
