import { useTranslation } from 'react-i18next';
import { AccountShell, useAuth } from '@sojecki/platform-web-platform';
import { useRodManagerAccountSections } from './rodManagerAccountSections';

export const AccountPage = () => {
  const { t } = useTranslation('account');
  const { user } = useAuth();
  const sections = useRodManagerAccountSections();

  return (
    <AccountShell
      roleLabel={t('roleLabel')}
      sections={sections}
      title={t('title')}
      user={user}
      welcomeMessage={t('welcome', {
        name: user?.displayName ?? t('fallbackUserName'),
      })}
    />
  );
};
