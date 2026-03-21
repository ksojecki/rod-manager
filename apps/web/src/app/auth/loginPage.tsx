import { Link, Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from './authContext';
import { LoginForm } from './components/LoginForm';
import { OAuthLoginButtons } from './components/OAuthLoginButtons';

export function LoginPage() {
  const { t } = useTranslation('auth');
  const { status } = useAuth();

  if (status === 'authenticated') {
    return <Navigate replace to="/account" />;
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <section className="w-full rounded-box bg-base-100 p-6 shadow flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <div className={'flex flex-row gap-4'}>
          <div className={'flex-1 h-fit'}>
            <OAuthLoginButtons />
          </div>
          <div className={'flex-1'}>
            <LoginForm />
          </div>
        </div>

        <p className="mt-4 text-center text-sm">
          {t('noAccount')}{' '}
          <Link className="link link-primary" to="/register">
            {t('registerLink')}
          </Link>
        </p>
      </section>
    </div>
  );
}
