import { useTranslation } from 'react-i18next';

export const LanguageSelector = () => {
  const { i18n, t } = useTranslation('layout');
  const locale = i18n.resolvedLanguage === 'pl' ? 'pl' : 'en';

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{t('languageLabel')}</h2>
      </div>

      <div className="mt-4">
        <select
          className="select select-bordered w-full"
          onChange={(event) => {
            void i18n.changeLanguage(event.target.value);
          }}
          value={locale}
        >
          <option value="en">{t('languageEnglish')}</option>
          <option value="pl">{t('languagePolish')}</option>
        </select>
      </div>
    </div>
  );
};
