import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from './routes';

describe('AppRoutes', () => {
  it('renders the home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('renders the account route', () => {
    render(
      <MemoryRouter initialEntries={['/account']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText('AccountPage')).toBeInTheDocument();
  });
});
