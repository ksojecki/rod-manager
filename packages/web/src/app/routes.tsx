import { Link, Outlet, Route, Routes } from 'react-router';

import { HomePage } from './home/homePage';
import { AccountPage } from './account/accountPage';

function AppLayout() {
  return (
    <div className="min-h-screen bg-base-200">
      <header className="navbar bg-base-100 shadow-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4">
          <Link to="/" className="btn btn-ghost text-lg">
            Rod Manager
          </Link>
          <nav className="flex gap-2">
            <Link to="/" className="btn btn-ghost btn-sm">
              Home
            </Link>
            <Link to="/account" className="btn btn-ghost btn-sm">
              Account
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <Outlet />
      </div>

      <footer className="footer footer-center bg-base-100 p-4 text-base-content shadow-inner">
        <p>Rod Manager</p>
      </footer>
    </div>
  );
}

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
