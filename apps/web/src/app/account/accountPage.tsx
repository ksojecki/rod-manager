import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/authContext';

export const AccountPage = () => {
  const { t } = useTranslation('account');
  const { user } = useAuth();

  return (
    <section className="space-y-2">
      <h1>{t('title')}</h1>
      <p>
        {t('welcome', { name: user?.displayName ?? t('fallbackUserName') })}
      </p>
      <p className="text-sm text-base-content/70">{user?.email ?? ''}</p>
    </section>
  );
};
