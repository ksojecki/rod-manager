import { Navigate } from 'react-router';
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
    <section className="mx-auto w-full max-w-md rounded-box bg-base-100 p-6 shadow">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>

      <LoginForm />

      <div className="divider mt-8 mb-6">{t('oauthDivider')}</div>

      <OAuthLoginButtons />
    </section>
  );
}
