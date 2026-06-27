import { Link } from 'react-router';
import { useAuth } from '@sojecki/platform-web-platform';
import {
  buildLoginPromptHref,
  frontendProductConfig,
} from '../../productConfig';

export function Navbar() {
  const { logout, status, user } = useAuth();
  const { registration, routes } = frontendProductConfig;

  return (
    <header className="border-b border-base-300 bg-base-100">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Link className="text-lg font-semibold" to={routes.home}>
          Sample Portal
        </Link>

        <nav className="flex items-center gap-3">
          <Link className="btn btn-ghost btn-sm" to={routes.home}>
            Home
          </Link>

          {registration.enabled && status === 'guest' ? (
            <Link className="btn btn-ghost btn-sm" to={routes.register}>
              Register
            </Link>
          ) : null}

          {status === 'authenticated' ? (
            <>
              <Link className="btn btn-ghost btn-sm" to={routes.account}>
                Account
              </Link>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  void logout();
                }}
                type="button"
              >
                Logout {user?.displayName ?? ''}
              </button>
            </>
          ) : (
            <Link
              className="btn btn-primary btn-sm"
              to={buildLoginPromptHref()}
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
