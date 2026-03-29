import { useTranslation } from 'react-i18next';

export const LanguageSelector = () => {
  const { i18n, t } = useTranslation('layout');
  const locale = i18n.resolvedLanguage === 'pl' ? 'pl' : 'en';

  return (
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
  );
};
