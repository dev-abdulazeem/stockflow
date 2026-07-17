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
  ChevronRight,
  BarChart3,
  Store,
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
    return `${currency}${parseFloat(amount || 0).toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 px-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
        <p className="text-sm text-gray-500 font-medium">AI is analyzing your store...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="truncate">AI Insights</span>
            </h1>
            <p className="text-xs text-gray-400">Powered by AI</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">
        {/* Date Badge */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        {/* AI Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 mb-2">Daily Summary</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {insights?.summary || 'No data available for analysis.'}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs text-gray-400">vs Yesterday</span>
            </div>
            <p className={`text-2xl font-bold ${insights?.salesChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {insights?.salesChange >= 0 ? '+' : ''}{insights?.salesChange || 0}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Sales change</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs text-gray-400">Profit Margin</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {insights?.profitMargin || 0}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Avg. margin</p>
          </div>
        </div>

        {/* Top Performers */}
        {insights?.topProducts?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              Top Performers
            </h2>
            <div className="space-y-3">
              {insights.topProducts.map((product, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-xs font-bold text-amber-700 flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.quantity} sold today</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-600 flex-shrink-0">
                    {formatMoney(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Underperformers */}
        {insights?.slowProducts?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              Needs Attention
            </h2>
            <div className="space-y-3">
              {insights.slowProducts.map((product, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-xs font-bold text-red-700 flex-shrink-0">
                    !
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.daysSinceSale} days since last sale</p>
                  </div>
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex-shrink-0">
                    Slow
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stock Alerts */}
        {insights?.stockAlerts?.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              Restock Alerts
            </h2>
            <div className="space-y-3">
              {insights.stockAlerts.map((product, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.quantity} {product.unit} left</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-lg flex-shrink-0">
                    LOW
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {insights?.recommendations?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
              </div>
              Smart Recommendations
            </h2>
            <div className="space-y-3">
              {insights.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-emerald-700">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Closing Remark */}
        {insights?.closing && (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-medium text-emerald-800 italic">"{insights.closing}"</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <p className="text-xs text-gray-400 font-medium">AI analysis · Updates on refresh</p>
          </div>
        </div>
      </div>
    </div>
  );
}