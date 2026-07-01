import { Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  PlatformFooter,
  PlatformNavbar,
  type PlatformNavigationItem,
  useAuth,
} from '@ksojecki/platform-web-platform';
import { frontendProductConfig } from '../productConfig';

export function AppLayout() {
  const { t } = useTranslation('layout');
  const { status } = useAuth();
  const navigationItems: PlatformNavigationItem[] = [
    {
      label: t('menuHome'),
      to: frontendProductConfig.routes.home,
    },
    {
      label: t('menuAddRecipe'),
      to: frontendProductConfig.routes.recipeNew,
      visibility: 'authenticated',
    },
  ];
  const footerSections =
    status === 'authenticated'
      ? [
          {
            title: t('footerBrowseTitle'),
            links: [
              {
                label: t('menuHome'),
                to: frontendProductConfig.routes.home,
              },
              {
                label: t('menuAddRecipe'),
                to: frontendProductConfig.routes.recipeNew,
              },
            ],
          },
        ]
      : [];

  return (
    <div className="min-h-screen bg-base-200">
      <PlatformNavbar
        accountLabel={t('menuAccount')}
        accountTo={frontendProductConfig.routes.account}
        brandLabel={t('appName')}
        brandTo={frontendProductConfig.routes.home}
        items={navigationItems}
        loginLabel={t('menuLogin')}
        loginPrompt={frontendProductConfig.loginPrompt}
        loadingLabel={t('sessionLoading')}
        logoutLabel={t('menuLogout')}
        postLoginRedirectTo={frontendProductConfig.auth.postLoginRedirectTo}
        registerLabel={t('menuRegister')}
        registerTo={frontendProductConfig.routes.register}
        registrationEnabled={frontendProductConfig.registration.enabled}
        showGuestRegisterLink
      />
      <main className="px-4 py-8">
        <Outlet />
      </main>
      <PlatformFooter sections={footerSections} text={t('footerText')} />
    </div>
  );
}
