import { useTranslation } from 'react-i18next';

export const HomePage = () => {
  const { t } = useTranslation('home');

  return (
    <main className="min-h-screen bg-base-200 p-6">
      <section className="mx-auto max-w-2xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-3xl">{t('title')}</h1>
            <p>{t('description')}</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">{t('primaryAction')}</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
