import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('fundament: toolchain TDD', () => {
  it('arytmetyka działa (sanity)', () => {
    expect(1 + 1).toBe(2);
  });

  it('renderuje stronę główną z nazwą produktu', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /GreenLeaf CRM/i })).toBeInTheDocument();
  });
});
