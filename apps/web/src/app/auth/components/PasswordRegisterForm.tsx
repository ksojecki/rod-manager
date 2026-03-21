import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../authContext';
import { register as registerRequest } from '../authApi';
import { registerSchema, type RegisterFormValues } from './registerSchema';

/**
 * Registration form for creating an account with email and password.
 */
export function PasswordRegisterForm() {
  const { t } = useTranslation('auth');
  const { refreshSession } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerRequest(values);
      await refreshSession();
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
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
      >
        <label className="form-control w-full">
          <span className="label-text">{t('register.nameLabel')}</span>
          <input
            className="input input-bordered w-full"
            type="text"
            {...register('name')}
          />
          {errors.name !== undefined ? (
            <span className="label-text-alt mt-1 text-error">
              {t(errors.name.message ?? 'register.nameRequired')}
            </span>
          ) : null}
        </label>

        <label className="form-control w-full">
          <span className="label-text">{t('register.surnameLabel')}</span>
          <input
            className="input input-bordered w-full"
            type="text"
            {...register('surname')}
          />
          {errors.surname !== undefined ? (
            <span className="label-text-alt mt-1 text-error">
              {t(errors.surname.message ?? 'register.surnameRequired')}
            </span>
          ) : null}
        </label>

        <label className="form-control w-full">
          <span className="label-text">{t('register.emailLabel')}</span>
          <input
            className="input input-bordered w-full"
            type="email"
            {...register('email')}
          />
          {errors.email !== undefined ? (
            <span className="label-text-alt mt-1 text-error">
              {t(errors.email.message ?? 'register.emailRequired')}
            </span>
          ) : null}
        </label>

        <label className="form-control w-full">
          <span className="label-text">{t('register.passwordLabel')}</span>
          <input
            className="input input-bordered w-full"
            type="password"
            {...register('password')}
          />
          <span className="label-text-alt mt-1 text-base-content/60">
            {t('register.passwordHint')}
          </span>
          {errors.password !== undefined ? (
            <span className="label-text-alt mt-1 text-error">
              {t(errors.password.message ?? 'register.passwordMinLength')}
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
          {isSubmitting ? t('register.submitting') : t('register.submit')}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        {t('register.alreadyHaveAccount')}{' '}
        <Link className="link link-primary" to="/login">
          {t('register.loginLink')}
        </Link>
      </p>
    </>
  );
}
