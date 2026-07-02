import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PointsManager } from '@/components/admin/PointsManager';
import { loadStore } from '@/lib/store';
import i18n from '@/lib/i18n';

describe('PointsManager — pula punktów na Pulpicie', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('pl');
  });

  it('pokazuje 6 punktów z seedu (4 bazowe + 2 demo); dodanie nowego zapisuje do store', async () => {
    const user = userEvent.setup();
    render(<PointsManager />);
    expect(screen.getByText('Kąkolewice 17a')).toBeInTheDocument();
    expect(loadStore().pickupPoints).toHaveLength(6);

    await user.type(screen.getByLabelText('Nazwa'), 'Wągrowiec');
    await user.click(screen.getByRole('button', { name: 'Dodaj punkt' }));

    expect(screen.getByText('Wągrowiec')).toBeInTheDocument();
    expect(loadStore().pickupPoints).toHaveLength(7);
  });

  it('wyłączenie punktu ustawia isActive=false; punkt bez klientów da się usunąć', async () => {
    const user = userEvent.setup();
    render(<PointsManager />);

    // wyłącz Komorniki (ma klienta — brak przycisku usuń, jest toggle)
    const komorniki = loadStore().pickupPoints.find((p) => p.name === 'Komorniki')!;
    const toggles = screen.getAllByRole('button', { name: 'Aktywny' });
    // znajdź toggle w wierszu Komornik: kliknij po kolei aż komorniki nieaktywne — prościej: drugi wiersz
    await user.click(toggles[1]);
    expect(loadStore().pickupPoints.find((p) => p.id === komorniki.id)!.isActive).toBe(false);

    // dodaj świeży punkt i usuń go
    await user.type(screen.getByLabelText('Nazwa'), 'Chwilowy');
    await user.click(screen.getByRole('button', { name: 'Dodaj punkt' }));
    await user.click(screen.getByLabelText('Usuń punkt Chwilowy'));
    expect(loadStore().pickupPoints.some((p) => p.name === 'Chwilowy')).toBe(false);
  });
});
