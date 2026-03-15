import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/authContext';

export const Navbar = () => {
  const { t } = useTranslation('layout');
  const { logout, status, user } = useAuth();
  return (
    <header className="navbar bg-base-100 shadow-sm">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4">
        <Link to="/" className="btn btn-ghost text-lg">
          {t('appName')}
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/" className="btn btn-ghost btn-sm">
            {t('menuHome')}
          </Link>
          <Link to="/account" className="btn btn-ghost btn-sm">
            {t('menuAccount')}
          </Link>
          {status === 'authenticated' ? (
            <>
              <span className="hidden text-sm text-base-content/70 md:inline">
                {user?.displayName}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  void logout();
                }}
                type="button"
              >
                {t('menuLogout')}
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              {t('menuLogin')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
