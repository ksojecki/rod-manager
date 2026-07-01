import { useTranslation } from 'react-i18next';
import { Link, Section } from '@ksojecki/platform-ui';
import { buildLoginPromptHref } from '../productConfig';

export function RecipeAccessPrompt() {
  const { t } = useTranslation('recipes');

  return (
    <Section
      actions={
        <Link asButton to={buildLoginPromptHref()}>
          {t('authRequired.action')}
        </Link>
      }
      className="mx-auto max-w-3xl"
      description={t('authRequired.description')}
      title={t('authRequired.title')}
    >
      <div className="rounded-box border border-dashed border-base-300 bg-base-200/60 p-4 text-sm text-base-content/70">
        {t('authRequired.hint')}
      </div>
    </Section>
  );
}
