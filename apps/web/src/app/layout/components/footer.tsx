import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './languageSelector';

export const Footer = () => {
  const { t } = useTranslation('layout');
  return (
    <footer className="footer footer-center bg-base-100 p-4 text-base-content shadow-inner">
      <LanguageSelector />
      <p>{t('footerText')}</p>
    </footer>
  );
};
