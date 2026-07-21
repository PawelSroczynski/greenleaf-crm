import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionPanel } from '@/components/client/SubscriptionPanel';
import { InboxPanel } from '@/components/admin/InboxPanel';
import { loadStore } from '@/lib/store';
import i18n from '@/lib/i18n';

describe('F4 — harmonogram + prośba o zmianę daty → skrzynka', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('pl');
  });

  it('Abonament pokazuje harmonogram; prośba o zmianę trafia do skrzynki admina', async () => {
    const user = userEvent.setup();
    render(<SubscriptionPanel />);
    expect(screen.getByText('Harmonogram odbiorów')).toBeInTheDocument();

    // klik „Zmień datę" przy najbliższym terminie
    await user.click(screen.getAllByRole('button', { name: 'Zmień datę' })[0]);
    await user.type(screen.getByLabelText('Nowa data'), '2026-08-01');
    await user.click(screen.getByRole('button', { name: 'Wyślij' }));

    const reqs = loadStore().clientRequests;
    expect(reqs).toHaveLength(1);
    expect(reqs[0].kind).toBe('date_change');
    expect(reqs[0].toDate).toBe('2026-08-01');
  });

  it('Skrzynka admina wyświetla prośbę i pozwala oznaczyć przeczytane', async () => {
    const user = userEvent.setup();
    // najpierw klient wysyła
    const { unmount } = render(<SubscriptionPanel />);
    await user.click(screen.getAllByRole('button', { name: 'Zmień datę' })[0]);
    await user.type(screen.getByLabelText('Nowa data'), '2026-08-01');
    await user.click(screen.getByRole('button', { name: 'Wyślij' }));
    unmount();

    render(<InboxPanel />);
    expect(screen.getByText(/Prośba o zmianę odbioru/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Oznacz jako przeczytane' }));
    expect(screen.queryByRole('button', { name: 'Oznacz jako przeczytane' })).not.toBeInTheDocument();
  });
});
