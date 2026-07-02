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

    // wyłącz Komorniki jawnym przełącznikiem (role=switch, celowanie po nazwie punktu)
    const komorniki = loadStore().pickupPoints.find((p) => p.name === 'Komorniki')!;
    const toggle = screen.getByRole('switch', { name: 'Przełącznik aktywności punktu Komorniki' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    await user.click(toggle);
    expect(loadStore().pickupPoints.find((p) => p.id === komorniki.id)!.isActive).toBe(false);
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    // dodaj świeży punkt i usuń go (potwierdzając bezpiecznik)
    const { vi } = await import('vitest');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.type(screen.getByLabelText('Nazwa'), 'Chwilowy');
    await user.click(screen.getByRole('button', { name: 'Dodaj punkt' }));
    await user.click(screen.getByLabelText('Usuń punkt Chwilowy'));
    expect(loadStore().pickupPoints.some((p) => p.name === 'Chwilowy')).toBe(false);
  });
});

describe('PointsManager — bezpiecznik usuwania', () => {
  it('anulowanie potwierdzenia nie usuwa punktu; potwierdzenie usuwa', async () => {
    const { vi } = await import('vitest');
    const user = userEvent.setup();
    render(<PointsManager />);

    // Oborniki (demo) ma przycisk usuń
    const removeBtn = screen.getByLabelText('Usuń punkt Oborniki');

    // 1) anuluj → punkt zostaje
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    await user.click(removeBtn);
    expect(loadStore().pickupPoints.some((p) => p.name === 'Oborniki')).toBe(true);

    // 2) potwierdź → punkt znika
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
    await user.click(removeBtn);
    expect(loadStore().pickupPoints.some((p) => p.name === 'Oborniki')).toBe(false);
  });
});
