import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Check,
  Loader2,
  Package,
  Save,
} from 'lucide-react';

export default function RecordSale() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const currency = user?.currency || '₦';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      const available = data.products.filter((p) => p.quantity > 0);
      setProducts(available);
      const init = {};
      available.forEach((p) => (init[p.id] = 0));
      setQuantities(init);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, value) => {
    const product = products.find((p) => p.id === productId);
    const num = parseInt(value) || 0;
    const clamped = Math.max(0, Math.min(num, product?.quantity || 0));
    setQuantities((prev) => ({ ...prev, [productId]: clamped }));
  };

  const getTotalItems = () => {
    return Object.values(quantities).reduce((sum, q) => sum + q, 0);
  };

  const getTotalAmount = () => {
    return products.reduce((sum, p) => {
      const qty = quantities[p.id] || 0;
      return sum + parseFloat(p.sellingPrice) * qty;
    }, 0);
  };

  const handleSaveSales = async () => {
    const sales = products
      .filter((p) => (quantities[p.id] || 0) > 0)
      .map((p) => ({
        productId: p.id,
        quantity: quantities[p.id],
      }));

    if (sales.length === 0) {
      alert('Please enter quantities for at least one product.');
      return;
    }

    setSaving(true);
    try {
      await Promise.all(sales.map((sale) => api.post('/sales', sale)));
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        const reset = {};
        products.forEach((p) => (reset[p.id] = 0));
        setQuantities(reset);
        fetchProducts();
      }, 2000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record sales');
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Green Header */}
      <div className="bg-emerald-600 text-white sticky top-0 z-10 shadow-lg flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold">Record Sales</h1>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-40">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product..."
              className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Success Banner */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-emerald-700">Sales Recorded!</p>
                <p className="text-sm text-emerald-600">Stock updated automatically</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
              <p className="text-gray-500">Loading products...</p>
            </div>
          )}

          {/* Product List */}
          {!loading && (
            <div className="space-y-3">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
                >
                  {/* Product Image */}
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {currency}
                      {parseFloat(product.sellingPrice).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {product.quantity} in stock
                    </p>
                  </div>

                  {/* Quantity Input */}
                  <div className="flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      max={product.quantity}
                      value={quantities[product.id] || 0}
                      onChange={(e) =>
                        handleQuantityChange(product.id, e.target.value)
                      }
                      className="w-16 h-11 text-center text-base font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                    />
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No products found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try a different search or add products first
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Bar — ABOVE the bottom nav */}
      <div className="fixed bottom-[72px] left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-400">
              {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {currency}
              {getTotalAmount().toLocaleString()}
            </p>
          </div>

          <button
            onClick={handleSaveSales}
            disabled={saving || getTotalItems() === 0}
            className="px-8 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Sales
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}