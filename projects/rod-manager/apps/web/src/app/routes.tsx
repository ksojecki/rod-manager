import { Route, Routes } from 'react-router';
import {
  AuthProvider,
  OAuthCallbackPage,
  RequireAuth,
} from '@sojecki/platform-web-platform';

import { AccountPage } from './account/AccountPage';
import { AppLayout } from './layout/AppLayout';
import { RegisterPage } from './auth/RegisterPage';
import { ContentManagementPage } from './content-management/ContentManagementPage';
import { ContentPage } from './content-management/ContentPage';

export function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<ContentPage forcedSlug="home" />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/auth/oauth/callback/:provider"
            element={
              <OAuthCallbackPage
                authenticatedFallbackTo="/account"
                guestFallbackTo="/"
              />
            }
          />
          <Route
            path="/account"
            element={
              <RequireAuth guestRedirectTo="/?login=1">
                <AccountPage />
              </RequireAuth>
            }
          />
          <Route
            path="/pages"
            element={
              <RequireAuth guestRedirectTo="/?login=1">
                <ContentManagementPage />
              </RequireAuth>
            }
          />
          <Route path="/:slug" element={<ContentPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
