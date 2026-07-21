import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SwapPanel } from '@/components/client/SwapPanel';
import { loadStore } from '@/lib/store';
import i18n from '@/lib/i18n';

// Bieżący klient (Anna) ma paczkę z sezonowymi pozycjami czerwca.
// "Ogórek gruntowy" i "Cukinia" to sezonowe zamienniki spoza paczki.

function storedSwaps() {
  return loadStore().swaps;
}

describe('SwapPanel — moduł zamian (Wariant A)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('pl');
  });

  it('zamiana zapisuje Swap do store', async () => {
    const user = userEvent.setup();
    render(<SwapPanel />);
    expect(screen.getByText('Zamiany otwarte (termin: środa 20:00)')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Zamień' })[0]);
    await user.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'Botwina' }),
    );

    const swaps = storedSwaps();
    expect(swaps).toHaveLength(1);
    const ogorek = loadStore().products.find((p) => p.name === 'Botwina')!;
    expect(swaps[0].replacementProductId).toBe(ogorek.id);
  });

  it('po zamianie można ZMIENIĆ wybór (upsert) i COFNĄĆ do oryginału', async () => {
    const user = userEvent.setup();
    render(<SwapPanel />);

    await user.click(screen.getAllByRole('button', { name: 'Zamień' })[0]);
    await user.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'Botwina' }),
    );
    expect(storedSwaps()).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Zmień' }));
    await user.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'Szczaw' }),
    );
    const cukinia = loadStore().products.find((p) => p.name === 'Szczaw')!;
    expect(storedSwaps()).toHaveLength(1);
    expect(storedSwaps()[0].replacementProductId).toBe(cukinia.id);

    await user.click(screen.getByRole('button', { name: 'Cofnij' }));
    expect(storedSwaps()).toHaveLength(0);
  });

  it('po terminie zamiany zablokowane (brak przycisku Zamień)', async () => {
    const user = userEvent.setup();
    render(<SwapPanel />);
    await user.click(screen.getByLabelText('Symuluj: po terminie'));
    expect(screen.getByText('Zamiany zamknięte (termin: środa 20:00)')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Zamień' })).not.toBeInTheDocument();
  });
});
