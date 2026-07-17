import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Loader2,
  Package,
  DollarSign,
  Calendar,
  RefreshCw,
  Zap,
  Brain,
} from 'lucide-react';

export default function AIInsights() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currency = user?.currency || '₦';

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/ai-insights');
      setInsights(data);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatMoney = (amount) => {
    return `${currency}${parseFloat(amount || 0).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm text-gray-500">Gemini is analyzing your store...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="page-title flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            AI Insights
          </h1>
          <p className="text-xs text-gray-400">Powered by Gemini</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Date Badge */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar className="w-4 h-4" />
        <span>{new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>

      {/* AI Summary Card */}
      <div className="card bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50 border-purple-200">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 mb-2">Daily Summary</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {insights?.summary || 'No data available for analysis.'}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs text-gray-500">vs Yesterday</span>
          </div>
          <p className={`text-2xl font-bold ${insights?.salesChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {insights?.salesChange >= 0 ? '+' : ''}{insights?.salesChange || 0}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Sales change</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">Profit Margin</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {insights?.profitMargin || 0}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Avg. margin</p>
        </div>
      </div>

      {/* Top Performers */}
      {insights?.topProducts?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Top Performers
          </h2>
          <div className="space-y-3">
            {insights.topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-xs font-bold text-amber-700">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.quantity} sold today</p>
                </div>
                <p className="text-sm font-bold text-emerald-600">
                  {formatMoney(product.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Underperformers */}
      {insights?.slowProducts?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            Needs Attention
          </h2>
          <div className="space-y-3">
            {insights.slowProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-xs font-bold text-red-700">
                  !
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.daysSinceSale} days since last sale</p>
                </div>
                <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg">
                  Slow
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Alerts */}
      {insights?.stockAlerts?.length > 0 && (
        <div className="card border-amber-200 bg-amber-50">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Restock Alerts
          </h2>
          <div className="space-y-3">
            {insights.stockAlerts.map((product, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.quantity} {product.unit} left</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-lg">
                  LOW
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {insights?.recommendations?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Smart Recommendations
          </h2>
          <div className="space-y-3">
            {insights.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-700">{i + 1}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Closing Remark */}
      {insights?.closing && (
        <div className="card bg-gradient-to-r from-primary-50 to-emerald-50 border-primary-200">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <p className="text-sm font-medium text-primary-800 italic">"{insights.closing}"</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 pb-4">
        AI analysis powered by Google Gemini · Updates on refresh
      </p>
    </div>
  );
}