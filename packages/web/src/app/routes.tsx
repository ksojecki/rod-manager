import { Link, Outlet, Route, Routes } from 'react-router';
import { useTranslation } from 'react-i18next';

import { HomePage } from './home/homePage';
import { AccountPage } from './account/accountPage';

function AppLayout() {
  const { i18n, t } = useTranslation('layout');
  const locale = i18n.resolvedLanguage === 'pl' ? 'pl' : 'en';

  return (
    <div className="min-h-screen bg-base-200">
      <header className="navbar bg-base-100 shadow-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4">
          <Link to="/" className="btn btn-ghost text-lg">
            {t('appName')}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm">{t('languageLabel')}</span>
            <button
              className={`btn btn-xs ${locale === 'en' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => {
                void i18n.changeLanguage('en');
              }}
              type="button"
            >
              {t('languageEnglish')}
            </button>
            <button
              className={`btn btn-xs ${locale === 'pl' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => {
                void i18n.changeLanguage('pl');
              }}
              type="button"
            >
              {t('languagePolish')}
            </button>
          </div>
          <nav className="flex gap-2">
            <Link to="/" className="btn btn-ghost btn-sm">
              {t('menuHome')}
            </Link>
            <Link to="/account" className="btn btn-ghost btn-sm">
              {t('menuAccount')}
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <Outlet />
      </div>

      <footer className="footer footer-center bg-base-100 p-4 text-base-content shadow-inner">
        <p>{t('footerText')}</p>
      </footer>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>
    </Routes>
  );
}
