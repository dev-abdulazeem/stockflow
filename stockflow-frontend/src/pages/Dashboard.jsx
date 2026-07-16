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
  BarChart3,
  ArrowRight,
  Loader2,
  Bell,
  BellOff,
  BellRing,
  ChevronRight,
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
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Stock Value',
      value: formatMoney(stats?.totalStockValue),
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      link: '/products',
    },
    {
      title: 'Low Stock',
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
      color: 'bg-emerald-50 text-emerald-600',
      link: '/sales',
    },
    {
      title: "Today's Profit",
      value: formatMoney(stats?.todayProfit),
      icon: TrendingUp,
      color: 'bg-violet-50 text-violet-600',
      link: '/reports',
    },
  ];

  return (
    <div className="space-y-8 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">Welcome back</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{user?.name || 'User'}</h1>
        </div>

        {permission !== 'granted' ? (
          <button
            onClick={requestPermission}
            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center transition-colors"
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
            className="w-10 h-10 bg-emerald-50 hover:bg-emerald-100 rounded-2xl flex items-center justify-center transition-colors"
            title="Test notification"
          >
            <BellRing className="w-5 h-5 text-emerald-600" />
          </button>
        )}
      </div>

      {/* Stats Grid - Clean 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${
              card.alert ? 'ring-2 ring-amber-400 ring-offset-2' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1 font-medium">{card.title}</p>
          </Link>
        ))}
      </div>

      {/* Reports Banner */}
      <Link
        to="/reports"
        className="block bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200 hover:shadow-xl transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-lg">Reports</p>
              <p className="text-emerald-100 text-sm">View analytics & insights</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* Recent Sales */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-lg">Recent Sales</h2>
          <Link
            to="/sales"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {stats?.recentSales?.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {stats.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{sale.product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {sale.quantity} {sale.product.unit} · {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-600">
                    {currency}
                    {parseFloat(sale.totalAmount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No sales today</p>
              <p className="text-xs text-gray-300 mt-1">Record a sale to see it here</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div>
        <h2 className="font-bold text-gray-900 text-lg mb-4">Top Selling Products</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {stats?.topProducts?.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {stats.topProducts.map((product, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.quantity} sold</p>
                  </div>
                  <p className="text-sm font-bold text-gray-700">
                    {currency}
                    {parseFloat(product.totalAmount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No sales yet</p>
              <p className="text-xs text-gray-300 mt-1">Start selling to see top products</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}