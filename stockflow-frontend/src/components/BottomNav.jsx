import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingCart,
  Receipt,
  BarChart3,
  Settings,
} from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/add-product', icon: PlusCircle, label: 'Add' },
    { to: '/record-sale', icon: ShoppingCart, label: 'Sell' },
    { to: '/sales', icon: Receipt, label: 'Sales' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'More' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to));
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}