import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  const hideNavPaths = ['/login', '/register', '/forgot-password'];
  const showNav = !hideNavPaths.some(path => location.pathname.startsWith(path));

  // Check if current page needs extra bottom padding for mobile sticky buttons
  const stickyButtonPaths = ['/add-product', '/edit-product', '/record-sale'];
  const needsExtraPadding = stickyButtonPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {showNav && (
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main
          className={`flex-1 w-full ${
            needsExtraPadding
              ? 'pb-36 md:pb-6'
              : 'pb-24 md:pb-6'
          }`}
        >
          <div className="max-w-3xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}