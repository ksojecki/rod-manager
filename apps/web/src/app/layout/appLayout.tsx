import { Outlet } from 'react-router';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
