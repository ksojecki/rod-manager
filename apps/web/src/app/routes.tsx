import { Route, Routes } from 'react-router';

import { HomePage } from './home/homePage';
import { AccountPage } from './account/accountPage';
import { AppLayout } from './layout/appLayout';
import { AuthProvider } from './auth/authContext';
import { LoginPage } from './auth/loginPage';
import { RegisterPage } from './auth/registerPage';
import { OAuthCallbackPage } from './auth/oauthCallbackPage';
import { RequireAuth } from './auth/requireAuth';

export function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/auth/oauth/callback/:provider"
            element={<OAuthCallbackPage />}
          />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <AccountPage />
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
