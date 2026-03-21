import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../authContext';
import { loginSchema, type LoginFormValues } from './loginSchema';

/**
 * Login form for authenticating with email and password.
 */
export function LoginForm() {
  const { t } = useTranslation('auth');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values.email, values.password);
      await navigate('/account', { replace: true });
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : t('unexpectedError'),
      });
    }
  }

  return (
    <>
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
      >
        <label className="form-control w-full">
          <span className="label-text">{t('emailLabel')}</span>
          <input
            className="input input-bordered w-full"
            type="email"
            {...register('email')}
          />
          {errors.email !== undefined ? (
            <span className="label-text-alt mt-1 text-error">
              {t(errors.email.message ?? 'emailRequired')}
            </span>
          ) : null}
        </label>

        <label className="form-control w-full">
          <span className="label-text">{t('passwordLabel')}</span>
          <input
            className="input input-bordered w-full"
            type="password"
            {...register('password')}
          />
          {errors.password !== undefined ? (
            <span className="label-text-alt mt-1 text-error">
              {t(errors.password.message ?? 'passwordRequired')}
            </span>
          ) : null}
        </label>

        {errors.root !== undefined ? (
          <p className="text-sm text-error">{errors.root.message}</p>
        ) : null}

        <button
          className="btn btn-primary w-full"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        {t('noAccount')}{' '}
        <Link className="link link-primary" to="/register">
          {t('registerLink')}
        </Link>
      </p>
    </>
  );
}
