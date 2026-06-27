import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';
import i18n, { LANG_KEY } from '@/lib/i18n';

// Klucz różnicujący PL vs EN użyty w teście: roles.title
//   pl.json → "Wybierz rolę"
//   en.json → "Choose your role"

describe('i18n: przełączanie języka PL/EN', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('pl');
  });

  it('domyślnie pokazuje polski nagłówek (roles.title)', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /Wybierz rolę/i })).toBeInTheDocument();
  });

  it('po kliknięciu EN ten sam nagłówek pokazuje string z en.json', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: /Wybierz rolę/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^en$/i }));

    expect(screen.getByRole('heading', { name: /Choose your role/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Wybierz rolę/i })).not.toBeInTheDocument();
  });

  it('wybór języka jest utrwalony w localStorage', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByRole('button', { name: /^en$/i }));

    expect(localStorage.getItem(LANG_KEY)).toBe('en');
  });
});
