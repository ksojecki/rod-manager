import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { Navbar } from './components/navbar';

export function AppLayout() {
  const { t } = useTranslation('layout');

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <Outlet />
      </div>

      <footer className="footer footer-center bg-base-100 p-4 text-base-content shadow-inner">
        <p>{t('footerText')}</p>
      </footer>
    </div>
  );
}
