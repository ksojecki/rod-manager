import { useTranslation } from 'react-i18next';

export const AccountPage = () => {
  const { t } = useTranslation('account');

  return <h1>{t('title')}</h1>;
};
