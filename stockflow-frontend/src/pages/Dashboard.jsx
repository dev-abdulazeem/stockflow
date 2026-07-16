import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { useNotifications } from '../hooks/useNotifications';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  PlusCircle,
  ShoppingCart,
  BarChart3,
  ArrowRight,
  Loader2,
  Bell,
  BellOff,
  BellRing,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { permission, requestPermission, sendLocalNotification } = useNotifications();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    // Send low stock notification when dashboard loads
    if (stats?.lowStockProducts > 0 && permission === 'granted') {
      sendLocalNotification('⚠️ Low Stock Alert', {
        body: `${stats.lowStockProducts} product(s) running low. Restock now!`,
        data: { url: '/products' },
        actions: [{ action: 'open', title: 'View Products' }],
      });
    }
  }, [stats, permission]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/reports/dashboard');
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const currency = user?.currency || '₦';

  const formatMoney = (amount) => {
    return `${currency}${parseFloat(amount || 0).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Stock Value',
      value: formatMoney(stats?.totalStockValue),
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      link: '/products',
    },
    {
      title: 'Low Stock Alert',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600',
      link: '/products',
      alert: (stats?.lowStockProducts || 0) > 0,
    },
    {
      title: "Today's Sales",
      value: formatMoney(stats?.todaySales),
      icon: DollarSign,
      color: 'bg-primary-50 text-primary-600',
      link: '/sales',
    },
    {
      title: "Today's Profit",
      value: formatMoney(stats?.todayProfit),
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
      link: '/reports',
    },
  ];

  const quickActions = [
    { to: '/add-product', icon: PlusCircle, label: 'Add Product', color: 'bg-primary-600' },
    { to: '/record-sale', icon: ShoppingCart, label: 'Record Sale', color: 'bg-emerald-600' },
    { to: '/reports', icon: BarChart3, label: 'View Reports', color: 'bg-blue-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Notification Bell */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Welcome back,</p>
          <h1 className="page-title">{user?.name}</h1>
        </div>

        {permission !== 'granted' ? (
          <button
            onClick={requestPermission}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
            title="Enable notifications"
          >
            <BellOff className="w-5 h-5 text-gray-400" />
          </button>
        ) : (
          <button
            onClick={() =>
              sendLocalNotification('StockFlow Test', {
                body: 'Notifications are working! 🎉',
                data: { url: '/' },
                actions: [{ action: 'open', title: 'Open' }],
              })
            }
            className="w-10 h-10 bg-primary-100 hover:bg-primary-200 rounded-xl flex items-center justify-center transition-colors"
            title="Test notification"
          >
            <BellRing className="w-5 h-5 text-primary-600" />
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={`${action.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity`}
          >
            <action.icon className="w-6 h-6" />
            <span className="text-xs font-medium text-center">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className={`card relative ${card.alert ? 'ring-2 ring-amber-400' : ''}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.title}</p>
          </Link>
        ))}
      </div>

      {/* Recent Sales */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Recent Sales</h2>
          <Link to="/sales" className="text-sm text-primary-600 font-medium">
            View All
          </Link>
        </div>
        {stats?.recentSales?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{sale.product.name}</p>
                  <p className="text-xs text-gray-500">
                    {sale.quantity} {sale.product.unit} · {new Date(sale.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <p className="text-sm font-semibold text-primary-600">
                  {currency}
                  {parseFloat(sale.totalAmount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No sales today</p>
        )}
      </div>

      {/* Top Products */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Top Selling Products</h2>
        {stats?.topProducts?.length > 0 ? (
          <div className="space-y-3">
            {stats.topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-xs font-bold text-primary-700">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.quantity} sold</p>
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {currency}
                  {parseFloat(product.totalAmount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No sales yet</p>
        )}
      </div>
    </div>
  );
}