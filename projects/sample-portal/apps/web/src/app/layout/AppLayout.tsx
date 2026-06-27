import { Outlet } from 'react-router';
import { Navbar } from './components/Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
