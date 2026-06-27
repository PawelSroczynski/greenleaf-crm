import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopBar } from '@/components/TopBar';
import { RoleProvider } from '@/lib/role-context';
import { loadStore, saveStore } from '@/lib/store';
import i18n from '@/lib/i18n';

describe('TopBar — reset danych symulatora', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('pl');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    Object.defineProperty(window.location, 'reload', { configurable: true, value: vi.fn() });
  });

  it('przycisk reset przywraca dane do stanu początkowego (seed)', async () => {
    const user = userEvent.setup();
    // zmutuj store: usuń wszystkich użytkowników
    const s = loadStore();
    s.users = [];
    saveStore(s);
    expect(loadStore().users.length).toBe(0);

    render(
      <RoleProvider>
        <TopBar />
      </RoleProvider>,
    );
    await user.click(screen.getByLabelText('Resetuj dane symulatora'));

    expect(loadStore().users.length).toBeGreaterThan(0); // świeży seed
  });
});
