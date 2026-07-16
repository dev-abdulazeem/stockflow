import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import {
  Calendar,
  Search,
  Trash2,
  Loader2,
  Receipt,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  X,
  Clock,
  Package,
} from 'lucide-react';

export default function SaleHistory() {
  const { user } = useAuthStore();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState('today');

  const currency = user?.currency || '₦';

  useEffect(() => {
    fetchSales();
  }, [page, dateFilter]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      let params = { page, limit: 20 };

      const today = new Date();
      if (dateFilter === 'today') {
        params.startDate = today.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        params.startDate = weekAgo.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1);
        params.startDate = monthAgo.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      }

      const { data } = await api.get('/sales', { params });
      setSales(data.sales);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to load sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this sale record? Stock will be restored.')) return;
    try {
      await api.delete(`/sales/${id}`);
      fetchSales();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = sales.filter((s) =>
    s.product.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalSales = filtered.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
  const totalProfit = filtered.reduce((sum, s) => sum + parseFloat(s.profit), 0);
  const totalItems = filtered.reduce((sum, s) => sum + s.quantity, 0);

  const filterOptions = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sale History</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {filtered.length} sale{filtered.length !== 1 ? 's' : ''} · {currency}
                {totalSales.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Receipt className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Summary Cards - Always fit screen, no overflow */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-1.5 sm:mb-2">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium">Sales</p>
            <p className="text-sm sm:text-base font-bold text-gray-900 mt-0.5 truncate">
              {currency}
              {totalSales.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-1.5 sm:mb-2">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium">Profit</p>
            <p className="text-sm sm:text-base font-bold text-emerald-600 mt-0.5 truncate">
              +{currency}
              {totalProfit.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-violet-50 rounded-lg flex items-center justify-center mb-1.5 sm:mb-2">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600" />
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium">Items</p>
            <p className="text-sm sm:text-base font-bold text-gray-900 mt-0.5 truncate">
              {totalItems.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Date Filter - Compact, fits without scroll */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex gap-1.5 flex-1">
            {filterOptions.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setDateFilter(f.key);
                  setPage(1);
                }}
                className={`flex-1 px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  dateFilter === f.key
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sales..."
            className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>

        {/* Sales List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((sale) => (
              <div
                key={sale.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 sm:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {sale.product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {sale.quantity} {sale.product.unit}
                      </span>
                      <span className="text-xs text-gray-300 hidden sm:inline">·</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(sale.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm sm:text-base">
                      {currency}
                      {parseFloat(sale.totalAmount).toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">
                      +{currency}
                      {parseFloat(sale.profit).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <div className="flex justify-end mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-gray-50">
                  <button
                    onClick={() => handleDelete(sale.id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No sales found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {search ? 'Try a different search term' : 'Record a sale to see it here'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-600 px-4 py-2 bg-white border border-gray-200 rounded-xl">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}