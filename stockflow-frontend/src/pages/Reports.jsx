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
} from 'recharts';
import {
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  Loader2,
  Calendar,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title">Reports</h1>

      {/* Period Selector */}
      <div className="flex gap-2">
        {[7, 14, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              days === d
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {d} Days
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-2">
            <DollarSign className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-xs text-gray-500">Total Sales</p>
          <p className="text-xl font-bold text-gray-900">
            {formatMoney(stats?.totalSales)}
          </p>
        </div>
        <div className="card">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs text-gray-500">Total Profit</p>
          <p className="text-xl font-bold text-emerald-600">
            +{formatMoney(stats?.totalProfit)}
          </p>
        </div>
        <div className="card">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-2">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500">Products</p>
          <p className="text-xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
        </div>
        <div className="card">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-xs text-gray-500">Total Orders</p>
          <p className="text-xl font-bold text-gray-900">{stats?.totalSalesCount || 0}</p>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Sales Trend</h2>
        {trend.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => new Date(val).getDate()}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(val) => `${currency}${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val) => [`${currency}${parseFloat(val).toLocaleString()}`, 'Sales']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ fill: '#059669', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No data for this period</p>
        )}
      </div>

      {/* Profit Trend */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Profit Trend</h2>
        {trend.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => new Date(val).getDate()}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(val) => `${currency}${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val) => [`${currency}${parseFloat(val).toLocaleString()}`, 'Profit']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No data for this period</p>
        )}
      </div>

      {/* Inventory Value */}
      {inventory && (
        <div className="card space-y-3">
          <h2 className="font-bold text-gray-900">Inventory Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Stock Value</p>
              <p className="text-lg font-bold text-gray-900">
                {formatMoney(inventory.totalValue)}
              </p>
            </div>
            <div className="bg-primary-50 rounded-lg p-3">
              <p className="text-xs text-primary-600">Potential Revenue</p>
              <p className="text-lg font-bold text-primary-700">
                {formatMoney(inventory.totalPotentialRevenue)}
              </p>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3">
            <p className="text-xs text-emerald-600">Potential Profit</p>
            <p className="text-lg font-bold text-emerald-700">
              +{formatMoney(inventory.totalPotentialProfit)}
            </p>
          </div>
        </div>
      )}

      {/* Categories */}
      {inventory?.categories?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-3">Categories</h2>
          <div className="space-y-2">
            {inventory.categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{cat.name}</span>
                <span className="text-sm font-bold text-gray-900">{cat.count} items</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}