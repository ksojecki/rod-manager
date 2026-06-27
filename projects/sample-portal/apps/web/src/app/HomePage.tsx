import { Link, useSearchParams } from 'react-router';
import { useAuth } from '@sojecki/platform-web-platform';
import { LoginPanel } from './auth/LoginPanel';
import {
  buildLoginPromptHref,
  clearLoginPrompt,
  frontendProductConfig,
  isLoginPromptRequested,
} from './productConfig';

export function HomePage() {
  const { status, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const showLoginPanel =
    status === 'guest' && isLoginPromptRequested(searchParams);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-box bg-base-100 p-6 shadow">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-base-content/60">
          Generated project
        </p>
        <h1 className="text-4xl font-semibold">Sample Portal</h1>
        <p className="max-w-2xl text-base-content/75">
          This starter product wires the shared backend and frontend platform
          libraries into a minimal product-local shell. Extend routes, branding,
          and sections here without copying Rod Manager app code.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {status === 'authenticated' ? (
          <Link
            className="btn btn-primary"
            to={frontendProductConfig.routes.account}
          >
            Open account
          </Link>
        ) : (
          <Link className="btn btn-primary" to={buildLoginPromptHref()}>
            Sign in
          </Link>
        )}
        {frontendProductConfig.registration.enabled ? (
          <Link
            className="btn btn-outline"
            to={frontendProductConfig.routes.register}
          >
            Register
          </Link>
        ) : null}
      </div>

      <div className="rounded-box border border-base-300 p-4">
        <h2 className="text-lg font-medium">Current auth state</h2>
        <p className="text-base-content/75">
          {status === 'authenticated'
            ? `Signed in as ${user?.email ?? 'unknown user'}.`
            : 'Guest session.'}
        </p>
      </div>

      {showLoginPanel ? (
        <div className="rounded-box border border-base-300 p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">Sign in</h2>
              <p className="text-sm text-base-content/70">
                This form is product-local UI layered on top of shared auth
                primitives from libs/web-platform.
              </p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSearchParams(clearLoginPrompt(searchParams), {
                  replace: true,
                });
              }}
              type="button"
            >
              Close
            </button>
          </div>
          <LoginPanel />
        </div>
      ) : null}
    </section>
  );
}
