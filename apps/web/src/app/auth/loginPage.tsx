import { useState, type SyntheticEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from './authContext';

export function LoginPage() {
  const { t } = useTranslation('auth');
  const { login, status } = useAuth();
  const navigate = useNavigate();

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
      await login(email, password);
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

  return (
    <section className="mx-auto w-full max-w-md rounded-box bg-base-100 p-6 shadow">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <label className="form-control w-full">
          <span className="label-text">{t('emailLabel')}</span>
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
          <span className="label-text">{t('passwordLabel')}</span>
          <input
            className="input input-bordered w-full"
            onChange={(event) => {
              setPassword(event.currentTarget.value);
            }}
            required
            type="password"
            value={password}
          />
        </label>

        {errorMessage !== null ? (
          <p className="text-sm text-error">{errorMessage}</p>
        ) : null}

        <button
          className="btn btn-primary w-full"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </button>
      </form>
    </section>
  );
}
