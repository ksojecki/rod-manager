import { Route, Routes } from 'react-router';

import { HomePage } from './home/HomePage';
import { AccountPage } from './account/AccountPage';
import { AppLayout } from './layout/AppLayout';
import { AuthProvider } from './auth/AuthContext';
import { RegisterPage } from './auth/RegisterPage';
import { OAuthCallbackPage } from './auth/OAuthCallbackPage';
import { RequireAuth } from './auth/RequireAuth';

export function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
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
