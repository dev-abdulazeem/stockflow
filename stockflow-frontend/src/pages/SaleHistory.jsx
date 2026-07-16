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

  return (
    <div className="space-y-4">
      <h1 className="page-title">Sale History</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">Total Sales</p>
          <p className="text-xl font-bold text-primary-600">
            {currency}
            {totalSales.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">Total Profit</p>
          <p className="text-xl font-bold text-emerald-600">
            +{currency}
            {totalProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'today', label: 'Today' },
          { key: 'week', label: 'This Week' },
          { key: 'month', label: 'This Month' },
          { key: 'all', label: 'All Time' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setDateFilter(f.key);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              dateFilter === f.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sales..."
          className="input-field pl-10"
        />
      </div>

      {/* Sales List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((sale) => (
            <div key={sale.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{sale.product.name}</h3>
                    <p className="text-xs text-gray-500">
                      {sale.quantity} {sale.product.unit} ·{' '}
                      {new Date(sale.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {currency}
                    {parseFloat(sale.totalAmount).toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-600">
                    +{currency}
                    {parseFloat(sale.profit).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleDelete(sale.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No sales found</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}