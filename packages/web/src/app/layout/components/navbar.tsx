import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const Navbar = () => {
  const { i18n, t } = useTranslation('layout');
  const locale = i18n.resolvedLanguage === 'pl' ? 'pl' : 'en';
  return (
    <header className="navbar bg-base-100 shadow-sm">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4">
        <Link to="/" className="btn btn-ghost text-lg">
          {t('appName')}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm">{t('languageLabel')}</span>
          <button
            className={`btn btn-xs ${locale === 'en' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              void i18n.changeLanguage('en');
            }}
            type="button"
          >
            {t('languageEnglish')}
          </button>
          <button
            className={`btn btn-xs ${locale === 'pl' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              void i18n.changeLanguage('pl');
            }}
            type="button"
          >
            {t('languagePolish')}
          </button>
        </div>
        <nav className="flex gap-2">
          <Link to="/" className="btn btn-ghost btn-sm">
            {t('menuHome')}
          </Link>
          <Link to="/account" className="btn btn-ghost btn-sm">
            {t('menuAccount')}
          </Link>
        </nav>
      </div>
    </header>
  );
};
