import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Menu,
} from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/sales', icon: Receipt, label: 'Sales' },
    { to: '/settings', icon: Menu, label: 'More' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="relative max-w-md mx-auto">
        {/* Main nav bar */}
        <div className="bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-end justify-around px-2 pb-3 pt-2">
            {/* Left items */}
            {navItems.slice(0, 2).map((item) => {
              const active = isActive(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={`flex flex-col items-center gap-1 px-4 py-1 min-w-[64px] transition-colors ${
                    active ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`}
                  />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </NavLink>
              );
            })}

            {/* Center Sell Button - Small floating pill */}
            <NavLink
              to="/record-sale"
              className={`relative -top-3 flex flex-col items-center justify-center w-12 h-12 rounded-full shadow-md transition-all active:scale-95 ${
                isActive('/record-sale')
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <ShoppingCart className="w-4 h-4 stroke-[2.5px]" />
              <span className="text-[9px] font-semibold mt-0.5">Sell</span>
            </NavLink>

            {/* Right items */}
            {navItems.slice(2).map((item) => {
              const active = isActive(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center gap-1 px-4 py-1 min-w-[64px] transition-colors ${
                    active ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`}
                  />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}