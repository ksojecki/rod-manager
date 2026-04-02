import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { ModalWindowApi } from '@rod-manager/ui';
import { useAuth } from '../../auth/AuthContext';
import { LoginModal } from '../../auth/components/LoginModal';

export const Navbar = () => {
  const { t } = useTranslation('layout');
  const { logout, status, user } = useAuth();
  const loginModalApi = useRef<ModalWindowApi | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const shouldOpenLogin =
      status === 'guest' && searchParams.get('login') === '1';
    if (!shouldOpenLogin) {
      return;
    }

    loginModalApi.current?.show();

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('login');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams, status]);

  return (
    <>
      <header className="navbar bg-base-100 shadow-sm">
        <div className="w-full mx-auto max-w-5xl flex items-center justify-between px-4">
          <Link to="/" className="text-lg">
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
              <button
                className="btn btn-primary btn-sm"
                onClick={() => loginModalApi.current?.show()}
                type="button"
              >
                {t('menuLogin')}
              </button>
            )}
          </nav>
        </div>
      </header>
      <LoginModal api={loginModalApi} />
    </>
  );
};
