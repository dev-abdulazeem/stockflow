import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  ShoppingBag,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Layers,
} from 'lucide-react';

export default function Reports() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const currency = user?.currency || '₦';

  useEffect(() => {
    fetchAll();
  }, [days]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, trendRes, invRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get(`/reports/sales-trend?days=${days}`),
        api.get('/reports/inventory'),
      ]);
      setStats(dashRes.data);
      setTrend(trendRes.data.trend);
      setInventory(invRes.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return `${currency}${parseFloat(amount || 0).toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const CustomTooltip = ({ active, payload, label, title }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
          <p className="text-xs text-gray-400 mb-1">
            {new Date(label).toLocaleDateString('en-NG', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </p>
          <p className="text-sm font-bold text-gray-900">
            {currency}
            {parseFloat(payload[0].value).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">{title}</p>
        </div>
      );
    }
    return null;
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
      title: 'Total Sales',
      value: formatMoney(stats?.totalSales),
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Profit',
      value: `+${formatMoney(stats?.totalProfit)}`,
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-600',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-violet-50 text-violet-600',
      trend: null,
    },
    {
      title: 'Orders',
      value: stats?.totalSalesCount || 0,
      icon: ShoppingBag,
      color: 'bg-amber-50 text-amber-600',
      trend: '+5%',
      trendUp: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Reports</h1>
              <p className="text-xs text-gray-400 mt-0.5">Business analytics & insights</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <PieChart className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div className="flex gap-1.5">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  days === d
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5" />
                </div>
                {card.trend && (
                  <span
                    className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
                      card.trendUp
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {card.trendUp ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {card.trend}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-medium">{card.title}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Sales Trend Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900">Sales Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Revenue over time</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              Live
            </div>
          </div>
          {trend.length > 0 ? (
            <div className="h-56 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) =>
                      new Date(val).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
                    }
                    stroke="#e5e7eb"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#e5e7eb"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip title="Sales" />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No sales data for this period</p>
            </div>
          )}
        </div>

        {/* Profit Trend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900">Profit Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Daily profit breakdown</p>
            </div>
          </div>
          {trend.length > 0 ? (
            <div className="h-48 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) =>
                      new Date(val).toLocaleDateString('en-NG', { day: 'numeric' })
                    }
                    stroke="#e5e7eb"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#e5e7eb"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip title="Profit" />} />
                  <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No profit data for this period</p>
            </div>
          )}
        </div>

        {/* Inventory Value */}
        {inventory && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Inventory Overview</h2>
                <p className="text-xs text-gray-400">Current stock valuation</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 font-medium">Stock Value</p>
                <p className="text-base font-bold text-gray-900 mt-1">
                  {formatMoney(inventory.totalValue)}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-xs text-emerald-600 font-medium">Revenue</p>
                <p className="text-base font-bold text-emerald-700 mt-1">
                  {formatMoney(inventory.totalPotentialRevenue)}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-600 font-medium">Profit</p>
                <p className="text-base font-bold text-blue-700 mt-1">
                  +{formatMoney(inventory.totalPotentialProfit)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        {inventory?.categories?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Categories</h2>
            <div className="space-y-3">
              {inventory.categories.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i % 4 === 0
                        ? 'bg-emerald-50 text-emerald-600'
                        : i % 4 === 1
                        ? 'bg-blue-50 text-blue-600'
                        : i % 4 === 2
                        ? 'bg-violet-50 text-violet-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {cat.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{cat.count}</span>
                  <span className="text-xs text-gray-400">items</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}