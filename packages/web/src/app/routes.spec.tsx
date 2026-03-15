import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { I18nextProvider } from 'react-i18next';
import { beforeEach, describe, expect, it } from 'vitest';
import i18n from './i18n/i18n';
import { AppRoutes } from './routes';

beforeEach(async () => {
  await i18n.changeLanguage('en');
});

describe('AppRoutes', () => {
  it('renders the home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <I18nextProvider i18n={i18n}>
          <AppRoutes />
        </I18nextProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('renders the account route', () => {
    render(
      <MemoryRouter initialEntries={['/account']}>
        <I18nextProvider i18n={i18n}>
          <AppRoutes />
        </I18nextProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Account' }),
    ).toBeInTheDocument();
  });

  it('switches the interface to Polish', async () => {
    const user = userEvent.setup();

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
