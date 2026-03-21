import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from './i18n/i18n';
import { AppRoutes } from './routes';

const fetchSpy = vi.spyOn(globalThis, 'fetch');

function mockGuestSession() {
  fetchSpy.mockResolvedValueOnce(
    new Response(JSON.stringify({ message: 'Not authenticated.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

beforeEach(async () => {
  fetchSpy.mockReset();
  await i18n.changeLanguage('en');
});

afterEach(() => {
  fetchSpy.mockReset();
});

describe('AppRoutes', () => {
  it('renders the home route', async () => {
    mockGuestSession();

    render(
      <MemoryRouter initialEntries={['/']}>
        <I18nextProvider i18n={i18n}>
          <AppRoutes />
        </I18nextProvider>
      </MemoryRouter>,
    );

    await screen.findByRole('link', { name: 'Log in' });
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('redirects unauthenticated account route to login page', async () => {
    mockGuestSession();

    render(
      <MemoryRouter initialEntries={['/account']}>
        <I18nextProvider i18n={i18n}>
          <AppRoutes />
        </I18nextProvider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: 'Log in' }),
    ).toBeInTheDocument();
  });

  it('renders register page with password and OAuth sections', async () => {
    mockGuestSession();

    render(
      <MemoryRouter initialEntries={['/register']}>
        <I18nextProvider i18n={i18n}>
          <AppRoutes />
        </I18nextProvider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: 'Create account' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Create account with password' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Create account with OAuth' }),
    ).toBeInTheDocument();
  });

  it('switches the interface to Polish', async () => {
    const user = userEvent.setup();
    mockGuestSession();

    render(
      <MemoryRouter initialEntries={['/']}>
        <I18nextProvider i18n={i18n}>
          <AppRoutes />
        </I18nextProvider>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'PL' }));

    expect(
      screen.getByRole('heading', { name: 'Strona glowna' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Jezyk')).toBeInTheDocument();
  });
});
