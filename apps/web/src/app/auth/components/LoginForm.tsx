import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../authContext';
import { AuthFormField } from './AuthFormField';
import { loginSchema, type LoginFormValues } from './loginSchema';
import { useAuthForm } from './useAuthForm';

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
  const { withErrorHandling } = useAuthForm(setError);

  async function onSubmit(values: LoginFormValues) {
    await login(values.email, values.password);
    await navigate('/account', { replace: true });
  }

  return (
    <>
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          void handleSubmit(withErrorHandling(onSubmit))(event);
        }}
      >
        <AuthFormField
          errorMessage={
            errors.email !== undefined
              ? t(getEmailErrorKey(errors.email.message))
              : undefined
          }
          label={t('emailLabel')}
          registration={register('email')}
          type="email"
        />

        <AuthFormField
          errorMessage={
            errors.password !== undefined
              ? t(getPasswordErrorKey(errors.password.message))
              : undefined
          }
          label={t('passwordLabel')}
          registration={register('password')}
          type="password"
        />

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

function getEmailErrorKey(
  message: string | undefined,
): 'emailInvalid' | 'emailRequired' {
  return message === 'emailInvalid' ? 'emailInvalid' : 'emailRequired';
}

function getPasswordErrorKey(message: string | undefined): 'passwordRequired' {
  return message === 'passwordRequired'
    ? 'passwordRequired'
    : 'passwordRequired';
}
