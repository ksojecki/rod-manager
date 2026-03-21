import { useState, type SyntheticEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from './authContext';
import {
  initiateOAuth,
  register as registerRequest,
  storeOAuthState,
} from './authApi';
import type { OAuthProviderType } from '@rod-manager/shared';

export function RegisterPage() {
  const { t } = useTranslation('auth');
  const { refreshSession, status } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate replace to="/account" />;
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await registerRequest({
        email,
        name,
        surname,
        password: password.length > 0 ? password : undefined,
      });
      await refreshSession();
      await navigate('/account', { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(t('unexpectedError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOAuthRegister(provider: OAuthProviderType) {
    setErrorMessage(null);
    try {
      const { authorizationUrl, state, codeVerifier } =
        await initiateOAuth(provider);

      storeOAuthState(state, codeVerifier);
      window.location.href = authorizationUrl;
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(t('unexpectedError'));
      }
    }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-box bg-base-100 p-6 shadow">
      <h1 className="text-2xl font-semibold">{t('register.title')}</h1>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <label className="form-control w-full">
          <span className="label-text">{t('register.nameLabel')}</span>
          <input
            className="input input-bordered w-full"
            onChange={(event) => {
              setName(event.currentTarget.value);
            }}
            required
            type="text"
            value={name}
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text">{t('register.surnameLabel')}</span>
          <input
            className="input input-bordered w-full"
            onChange={(event) => {
              setSurname(event.currentTarget.value);
            }}
            required
            type="text"
            value={surname}
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text">{t('register.emailLabel')}</span>
          <input
            className="input input-bordered w-full"
            onChange={(event) => {
              setEmail(event.currentTarget.value);
            }}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text">{t('register.passwordLabel')}</span>
          <input
            className="input input-bordered w-full"
            onChange={(event) => {
              setPassword(event.currentTarget.value);
            }}
            type="password"
            value={password}
          />
          <span className="label-text-alt mt-1 text-base-content/60">
            {t('register.passwordHint')}
          </span>
        </label>

        {errorMessage !== null ? (
          <p className="text-sm text-error">{errorMessage}</p>
        ) : null}

        <button
          className="btn btn-primary w-full"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? t('register.submitting') : t('register.submit')}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        {t('register.alreadyHaveAccount')}{' '}
        <Link className="link link-primary" to="/login">
          {t('register.loginLink')}
        </Link>
      </p>

      {/* OAuth Divider */}
      <div className="divider mt-8 mb-6">or continue with</div>

      {/* OAuth Buttons */}
      <div className="space-y-3">
        <button
          className="btn btn-outline w-full"
          onClick={() => {
            void handleOAuthRegister('google');
          }}
          type="button"
        >
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        <button
          className="btn btn-outline w-full"
          onClick={() => {
            void handleOAuthRegister('apple');
          }}
          type="button"
        >
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.05 13.5c-.91 2.04-.36 3.43 1.07 4.64 1.05.91 2.74 1.39 3.62 1.39.22 0 .41-.02.58-.05-.54 1.6-1.83 2.76-3.53 3.43-1.48.56-2.71.56-3.79-.05-1.13-.66-2.09-2.04-2.63-3.64-.25-.78-.46-1.69-.46-2.7 0-1.01.21-1.92.46-2.7.54-1.6 1.5-2.98 2.63-3.64 1.08-.61 2.31-.61 3.79-.05 1.7.67 2.99 1.83 3.53 3.43-.17-.03-.36-.05-.58-.05-.88 0-2.57.48-3.62 1.39-1.43 1.21-1.98 2.6-1.07 4.64z" />
          </svg>
          Apple
        </button>

        <button
          className="btn btn-outline w-full"
          onClick={() => {
            void handleOAuthRegister('facebook');
          }}
          type="button"
        >
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>
    </section>
  );
}
