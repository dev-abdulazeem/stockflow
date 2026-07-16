import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import {
  Search,
  Package,
  Plus,
  AlertTriangle,
  Loader2,
  Pencil,
  Trash2,
  SlidersHorizontal,
  X,
  ChevronRight,
} from 'lucide-react';

export default function ProductList() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [deleting, setDeleting] = useState(false);

  const currency = user?.currency || '₦';
  const threshold = user?.lowStockThreshold || 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter effect - runs whenever filter inputs change
  useEffect(() => {
    let result = [...products];

    if (search.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase().trim())
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (lowStockOnly) {
      result = result.filter((p) => p.quantity <= threshold);
    }

    setFiltered(result);
  }, [search, categoryFilter, lowStockOnly, products, threshold]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.products || []);
      setFiltered(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (product) => {
    setDeleteModal({ open: true, product });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, product: null });
    setDeleting(false);
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteModal.product.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteModal.product.id));
      closeDeleteModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6 overflow-x-hidden">
      {/* Delete Confirmation Modal - EMERALD THEME */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeDeleteModal}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-all">
            {/* Icon */}
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-emerald-600" />
            </div>
            
            {/* Content */}
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Delete Product?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">"{deleteModal.product?.name}"</span>? This action cannot be undone.
            </p>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {filtered.length} of {products.length} products
            </p>
          </div>
          <Link
            to="/add-product"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all"
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

        {/* Filter Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              showFilters || categoryFilter !== 'all' || lowStockOnly
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {(categoryFilter !== 'all' || lowStockOnly) && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </button>

          {categoryFilter !== 'all' && (
            <button
              onClick={() => setCategoryFilter('all')}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {categoryFilter}
              <X className="w-3 h-3" />
            </button>
          )}

          {lowStockOnly && (
            <button
              onClick={() => setLowStockOnly(false)}
              className="flex items-center gap-1 px-3 py-2 bg-amber-50 rounded-xl text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
            >
              Low Stock
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Categories
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Show low stock only
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Product List */}
        <div className="space-y-3">
          {filtered.map((product) => {
            const isLow = product.quantity <= threshold;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  isLow ? 'border-amber-300' : 'border-gray-100'
                }`}
              >
                {/* Card Content */}
                <div className="p-4 flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {product.category || 'Uncategorized'}
                        </p>
                      </div>
                      {isLow && (
                        <span className="flex-shrink-0 px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                          Low Stock
                        </span>
                      )}
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {currency}
                          {parseFloat(product.sellingPrice).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          <span className="text-emerald-600 font-medium">
                            {product.quantity} {product.unit}
                          </span>{' '}
                          in stock
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex border-t border-gray-100">
                  <Link
                    to={`/edit-product/${product.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors border-r border-gray-100"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => openDeleteModal(product)}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No products found</p>
              <p className="text-sm text-gray-400 mt-1">
                {search || categoryFilter !== 'all' || lowStockOnly
                  ? 'Try adjusting your filters'
                  : 'Add your first product to get started'}
              </p>
              {!search && categoryFilter === 'all' && !lowStockOnly && (
                <Link
                  to="/add-product"
                  className="inline-flex items-center gap-2 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-medium text-sm transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}