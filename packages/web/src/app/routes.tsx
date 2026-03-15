import { Route, Routes } from 'react-router';

import { HomePage } from './home/homePage';
import { AccountPage } from './account/accountPage';
import { AppLayout } from './layout/appLayout';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>
    </Routes>
  );
}
