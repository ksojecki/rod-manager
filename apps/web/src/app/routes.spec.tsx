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

function mockAuthenticatedAccountSession() {
  fetchSpy
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          authenticated: true,
          user: {
            id: 'user-1',
            email: 'user@example.com',
            name: 'Test',
            surname: 'User',
            displayName: 'Test User',
            role: 'user',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          methods: [
            { type: 'password', connected: false, canDisconnect: false },
            {
              type: 'oauth',
              provider: 'google',
              connected: true,
              canDisconnect: false,
            },
            {
              type: 'oauth',
              provider: 'apple',
              connected: false,
              canDisconnect: false,
            },
            {
              type: 'oauth',
              provider: 'facebook',
              connected: false,
              canDisconnect: false,
            },
          ],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
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

    await screen.findByRole('button', { name: 'Log in' });
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('opens login modal after redirecting unauthenticated account route', async () => {
    mockGuestSession();

    render(
      <MemoryRouter initialEntries={['/account']}>
        <I18nextProvider i18n={i18n}>
          <AppRoutes />
        </I18nextProvider>
      </MemoryRouter>,
    );

    const modal = await screen.findByRole('dialog');
    expect(modal).toHaveAttribute('open');
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
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
    mockAuthenticatedAccountSession();

    render(
      <MemoryRouter initialEntries={['/account']}>
        <I18nextProvider i18n={i18n}>
          <AppRoutes />
        </I18nextProvider>
      </MemoryRouter>,
    );

    await user.selectOptions(await screen.findByRole('combobox'), 'pl');

    expect(
      await screen.findByRole('heading', { name: 'Konto' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Język')).toBeInTheDocument();
  });
});
