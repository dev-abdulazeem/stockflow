import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import {
  Search,
  Filter,
  Package,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';

export default function ProductList() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const currency = user?.currency || '₦';
  const threshold = user?.lowStockThreshold || 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;

    if (search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (lowStockOnly) {
      result = result.filter((p) => p.quantity <= threshold);
    }

    setFiltered(result);
  }, [search, categoryFilter, lowStockOnly, products]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.products);
      setFiltered(data.products);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete');
    }
  };

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Products</h1>
        <Link
          to="/add-product"
          className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white hover:bg-primary-700"
        >
          <PlusCircle className="w-5 h-5" />
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
              lowStockOnly
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </button>
        </div>
      </div>

      {/* Product Count */}
      <p className="text-sm text-gray-500">
        {filtered.length} product{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Product Grid */}
      <div className="space-y-3">
        {filtered.map((product) => {
          const isLow = product.quantity <= threshold;

          return (
            <div
              key={product.id}
              className={`card flex gap-4 ${isLow ? 'ring-1 ring-amber-400' : ''}`}
            >
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.category || 'Uncategorized'}</p>
                  </div>
                  {isLow && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                      LOW
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-lg font-bold text-primary-600">
                      {currency}
                      {parseFloat(product.sellingPrice).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Stock: {product.quantity} {product.unit}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/edit-product/${product.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
  <Pencil className="w-4 h-4 text-gray-400" />
</Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No products found</p>
            <Link to="/add-product" className="text-primary-600 text-sm font-medium mt-2 inline-block">
              Add your first product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}