import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';
import { ROLE_KEY } from '@/lib/role-context';

describe('role: RolePicker + przełączanie shelli', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renderuje 4 kafelki ról', () => {
    render(<HomePage />);
    expect(screen.getByRole('button', { name: /Rolnik \/ Admin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Klient RWS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Klient zewnętrzny/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dostawca/i })).toBeInTheDocument();
  });

  it('klik "Klient RWS" ustawia rolę i renderuje ClientShell z bottom tab barem', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByRole('button', { name: /Klient RWS/i }));

    expect(screen.getByRole('button', { name: /Moja paczka/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Abonament/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Profil/i })).toBeInTheDocument();
    expect(localStorage.getItem(ROLE_KEY)).toBe('klient_rws');
  });

  it('klik "Rolnik/Admin" renderuje AdminShell z nawigacją', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByRole('button', { name: /Rolnik \/ Admin/i }));

    expect(screen.getByRole('button', { name: /^Pulpit$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Klienci$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Odbiory$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Eksport$/i })).toBeInTheDocument();
    expect(localStorage.getItem(ROLE_KEY)).toBe('admin');
  });

  it('Pulpit admina pokazuje realne liczby ze store (5 aktywnych klientów)', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByRole('button', { name: /Rolnik \/ Admin/i }));

    expect(await screen.findByText('5')).toBeInTheDocument();
    expect(screen.getAllByText(/tydzień 4/i).length).toBeGreaterThanOrEqual(1);
  });
});
