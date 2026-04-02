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
      <div className="flex gap-2 flex-row">
        <div className={'flex-1'}>
          <h2 className="text-lg font-medium ">
            {t('register.passwordSectionTitle')}
          </h2>
          <p className="mb-4 text-sm text-base-content/70">
            {t('register.oauthSectionHint')}
          </p>
          <PasswordRegisterForm />
        </div>
        <div className="divider divider-horizontal">{t('or')}</div>
        <div className={'flex-1'}>
          <h2 className="text-lg font-medium">
            {t('register.oauthSectionTitle')}
          </h2>
          <p className="mb-4 text-sm text-base-content/70">
            {t('register.oauthSectionHint')}
          </p>
          <OAuthRegisterButtons />
        </div>
      </div>
    </section>
  );
}
