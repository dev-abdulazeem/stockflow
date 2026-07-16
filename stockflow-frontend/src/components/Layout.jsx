import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  const hideNavPaths = ['/login'];
  const showNav = !hideNavPaths.includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showNav && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 pb-24 md:pb-4 md:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
        
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}