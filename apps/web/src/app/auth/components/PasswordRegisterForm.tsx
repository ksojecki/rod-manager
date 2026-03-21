import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormField } from '@rod-manager/ui';
import { useAuth } from '../authContext';
import { register as registerRequest } from '../authApi';
import { registerSchema, type RegisterFormValues } from './registerSchema';
import { useAuthForm } from './useAuthForm';

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
  const { withErrorHandling } = useAuthForm(setError);

  async function onSubmit(values: RegisterFormValues) {
    await registerRequest(values);
    await refreshSession();
    await navigate('/account', { replace: true });
  }

  return (
    <>
      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          void handleSubmit(withErrorHandling(onSubmit))(event);
        }}
      >
        <FormField
          errorMessage={
            errors.name !== undefined
              ? t(getNameErrorKey(errors.name.message))
              : undefined
          }
          label={t('register.nameLabel')}
          registration={register('name')}
          type="text"
        />

        <FormField
          errorMessage={
            errors.surname !== undefined
              ? t(getSurnameErrorKey(errors.surname.message))
              : undefined
          }
          label={t('register.surnameLabel')}
          registration={register('surname')}
          type="text"
        />

        <FormField
          errorMessage={
            errors.email !== undefined
              ? t(getRegisterEmailErrorKey(errors.email.message))
              : undefined
          }
          label={t('register.emailLabel')}
          registration={register('email')}
          type="email"
        />

        <FormField
          errorMessage={
            errors.password !== undefined
              ? t(getRegisterPasswordErrorKey(errors.password.message))
              : undefined
          }
          hint={t('register.passwordHint')}
          label={t('register.passwordLabel')}
          registration={register('password')}
          type="password"
        />

        {errors.root !== undefined ? (
          <p className="text-sm text-error">{errors.root.message}</p>
        ) : null}

        <Button fullWidth isLoading={isSubmitting} type="submit">
          {isSubmitting ? t('register.submitting') : t('register.submit')}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        {t('register.alreadyHaveAccount')}{' '}
        <Link className="link link-primary" to="/?login=1">
          {t('register.loginLink')}
        </Link>
      </p>
    </>
  );
}

function getNameErrorKey(message: string | undefined): 'register.nameRequired' {
  return message === 'register.nameRequired'
    ? 'register.nameRequired'
    : 'register.nameRequired';
}

function getSurnameErrorKey(
  message: string | undefined,
): 'register.surnameRequired' {
  return message === 'register.surnameRequired'
    ? 'register.surnameRequired'
    : 'register.surnameRequired';
}

function getRegisterEmailErrorKey(
  message: string | undefined,
): 'register.emailInvalid' | 'register.emailRequired' {
  return message === 'register.emailInvalid'
    ? 'register.emailInvalid'
    : 'register.emailRequired';
}

function getRegisterPasswordErrorKey(
  message: string | undefined,
): 'register.passwordMinLength' {
  return message === 'register.passwordMinLength'
    ? 'register.passwordMinLength'
    : 'register.passwordMinLength';
}
