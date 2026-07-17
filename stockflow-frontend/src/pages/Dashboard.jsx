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
  Sparkles,
  BellOff,
  BellRing,
  ChevronRight,
  User,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { permission, requestPermission, sendLocalNotification } = useNotifications();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchStats();
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6 overflow-x-hidden">
      {/* Clean Header - Free-standing avatar, no container */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Avatar - completely free, no box, no container */}
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-100"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-bold text-sm sm:text-base">
                    {getInitials(user?.name)}
                  </span>
                </div>
              )}
              
              {/* Greeting + Name */}
              <div>
                <p className="text-xs text-gray-400 font-medium">{greeting}</p>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                  {user?.name || 'User'}
                </h1>
              </div>
            </div>

            {permission !== 'granted' ? (
              <button
                onClick={requestPermission}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"
                title="Enable notifications"
              >
                <BellOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
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
                className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors"
                title="Test notification"
              >
                <BellRing className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-5 sm:space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          {statCards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className={`bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${
                card.alert ? 'ring-2 ring-amber-400 ring-offset-1 sm:ring-offset-2' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
              </div>
              <p className="text-base sm:text-xl font-bold text-gray-900 truncate">{card.value}</p>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 font-medium">{card.title}</p>
            </Link>
          ))}
        </div>

        {/* Reports Banner */}
        <Link
          to="/reports"
          className="block bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-white shadow-md sm:shadow-lg shadow-emerald-200 hover:shadow-lg sm:hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="font-bold text-sm sm:text-lg">Reports</p>
                <p className="text-emerald-100 text-xs sm:text-sm">View analytics & insights</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* AI Insights Teaser */}
        <Link
          to="/ai-insights"
          className="block bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm sm:text-base text-gray-900">AI Insights</p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Get Gemini-powered daily analysis</p>
            </div>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </div>
        </Link>

        {/* Recent Sales */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-bold text-gray-900 text-sm sm:text-lg">Recent Sales</h2>
            <Link
              to="/sales"
              className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {stats?.recentSales?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {stats.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{sale.product.name}</p>
                        <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                          {sale.quantity} {sale.product.unit} · {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-emerald-600 flex-shrink-0 ml-2">
                      {currency}
                      {parseFloat(sale.totalAmount).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                </div>
                <p className="text-xs sm:text-sm text-gray-400 font-medium">No sales today</p>
                <p className="text-[11px] sm:text-xs text-gray-300 mt-1">Record a sale to see it here</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div>
          <h2 className="font-bold text-gray-900 text-sm sm:text-lg mb-3 sm:mb-4">Top Selling Products</h2>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {stats?.topProducts?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {stats.topProducts.map((product, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md sm:rounded-lg flex items-center justify-center text-[11px] sm:text-xs font-bold text-gray-500 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                      <p className="text-[11px] sm:text-xs text-gray-400">{product.quantity} sold</p>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-700 flex-shrink-0 ml-2">
                      {currency}
                      {parseFloat(product.totalAmount).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                </div>
                <p className="text-xs sm:text-sm text-gray-400 font-medium">No sales yet</p>
                <p className="text-[11px] sm:text-xs text-gray-300 mt-1">Start selling to see top products</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}