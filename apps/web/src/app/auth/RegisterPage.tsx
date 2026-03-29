import { Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { OAuthRegisterButtons } from './components/OAuthRegisterButtons';
import { PasswordRegisterForm } from './components/PasswordRegisterForm';

export function RegisterPage() {
  const { t } = useTranslation('auth');
  const { status } = useAuth();

  if (status === 'authenticated') {
    return <Navigate replace to="/account" />;
  }

  return (
    <section className="mx-auto w-full max-w-5xl rounded-box bg-base-100 p-6 shadow">
      <h1 className="text-2xl font-semibold">{t('register.title')}</h1>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-medium">
            {t('register.passwordSectionTitle')}
          </h2>
          <PasswordRegisterForm />
        </div>

        <div>
          <h2 className="text-lg font-medium">
            {t('register.oauthSectionTitle')}
          </h2>
          <p className="mt-1 text-sm text-base-content/70">
            {t('register.oauthSectionHint')}
          </p>

          <div className="divider mt-4 mb-6">{t('register.oauthDivider')}</div>

          <OAuthRegisterButtons />
        </div>
      </div>
    </section>
  );
}
