import { Routes, Route } from 'react-router';

import { HomePage } from './home/homePage';
import { AccountPage } from './account/accountPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/account" element={<AccountPage />} />
    </Routes>
  );
}
