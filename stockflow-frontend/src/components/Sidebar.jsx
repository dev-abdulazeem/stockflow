import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingCart,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Store,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/add-product', icon: PlusCircle, label: 'Add Product' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/record-sale', icon: ShoppingCart, label: 'Record Sale' },
    { to: '/sales', icon: Receipt, label: 'Sales' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col sticky top-0 z-30">
      {/* Logo Section */}
      <div className="p-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 tracking-tight">StockFlow</h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {user?.storeName || 'My Store'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-2">
          Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                ({ isActive }) => isActive && 'bg-emerald-100'
              }`}
            >
              <item.icon
                className={`w-[18px] h-[18px] transition-colors ${
                  ({ isActive }) => (isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600')
                }`}
              />
            </div>
            <span className="flex-1">{item.label}</span>
            {({ isActive }) =>
              isActive && <ChevronRight className="w-4 h-4 text-emerald-400" />
            }
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 mt-auto">
        <div className="bg-gray-50 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-emerald-700">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
            <LogOut className="w-[18px] h-[18px]" />
          </div>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}