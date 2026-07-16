import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import {
  ArrowLeft,
  Search,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  Loader2,
  Package,
  ChevronRight,
  X,
} from 'lucide-react';

export default function RecordSale() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const currency = user?.currency || '₦';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.products.filter((p) => p.quantity > 0));
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleSubmit = async () => {
    if (!selectedProduct || quantity < 1) return;
    setLoading(true);
    try {
      await api.post('/sales', {
        productId: selectedProduct.id,
        quantity: parseInt(quantity),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedProduct(null);
        setQuantity(1);
        fetchProducts();
      }, 2000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = selectedProduct
    ? parseFloat(selectedProduct.sellingPrice) * quantity
    : 0;
  const profit = selectedProduct
    ? (parseFloat(selectedProduct.sellingPrice) - parseFloat(selectedProduct.costPrice)) * quantity
    : 0;

  // ============ STEP 1: SELECT PRODUCT ============
  if (!selectedProduct) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="page-title">Record Sale</h1>
            <p className="text-xs text-gray-400">Step 1 of 2 — Select a product</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product to sell..."
            className="input-field pl-12 py-4 text-base"
            autoFocus
          />
        </div>

        {/* Products Count */}
        <p className="text-sm text-gray-500 font-medium">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} available
        </p>

        {/* Product List */}
        <div className="space-y-3">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product)}
              className="card w-full text-left flex items-center gap-4 hover:border-primary-400 hover:shadow-md transition-all active:scale-[0.98]"
            >
              {/* Product Image */}
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-7 h-7 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-base">{product.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{product.category || 'No category'}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm font-bold text-primary-600">
                    {currency}{parseFloat(product.sellingPrice).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">/ {product.unit}</span>
                </div>
              </div>

              {/* Stock Badge */}
              <div className="text-right">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                  product.quantity <= 5 
                    ? 'bg-red-50 text-red-600' 
                    : product.quantity <= 10 
                    ? 'bg-amber-50 text-amber-600' 
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {product.quantity} left
                </span>
                <ChevronRight className="w-5 h-5 text-gray-300 mt-1 ml-auto" />
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No products found</p>
              <p className="text-sm text-gray-400 mt-1">Add products first to record sales</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============ STEP 2: ENTER QUANTITY & CONFIRM ============
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSelectedProduct(null)} 
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="page-title">Confirm Sale</h1>
          <p className="text-xs text-gray-400">Step 2 of 2 — Enter quantity</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-emerald-700">Sale Recorded!</p>
            <p className="text-sm text-emerald-600">Stock updated automatically</p>
          </div>
        </div>
      )}

      {/* Selected Product Card */}
      <div className="card bg-primary-50 border-primary-200">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
            {selectedProduct.image ? (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">{selectedProduct.name}</h3>
            <p className="text-sm text-gray-500">{selectedProduct.category || 'No category'}</p>
            <p className="text-xl font-bold text-primary-700 mt-1">
              {currency}{parseFloat(selectedProduct.sellingPrice).toLocaleString()}
              <span className="text-sm text-gray-400 font-normal"> / {selectedProduct.unit}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
          How many {selectedProduct.unit}?
        </label>
        
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-colors active:scale-95"
          >
            <Minus className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="text-center w-24">
            <span className="text-5xl font-bold text-gray-900">{quantity}</span>
            <p className="text-xs text-gray-400 mt-1">{selectedProduct.unit}</p>
          </div>
          
          <button
            onClick={() => setQuantity(Math.min(selectedProduct.quantity, quantity + 1))}
            className="w-16 h-16 bg-primary-100 hover:bg-primary-200 rounded-2xl flex items-center justify-center transition-colors active:scale-95"
          >
            <Plus className="w-6 h-6 text-primary-700" />
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          <span className="font-medium text-gray-600">{selectedProduct.quantity}</span> {selectedProduct.unit} available in stock
        </p>
      </div>

      {/* Price Breakdown */}
      <div className="card space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Order Summary</h3>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-500">Price per {selectedProduct.unit}</span>
          <span className="font-medium text-gray-900">
            {currency}{parseFloat(selectedProduct.sellingPrice).toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-500">Quantity</span>
          <span className="font-medium text-gray-900">× {quantity}</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-900 font-semibold">Total Amount</span>
          <span className="text-2xl font-bold text-primary-600">
            {currency}{totalAmount.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 bg-emerald-50 rounded-lg px-3">
          <span className="text-emerald-700 font-medium">Your Profit</span>
          <span className="text-lg font-bold text-emerald-600">
            +{currency}{profit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setSelectedProduct(null)}
          className="btn-secondary flex-1 py-4"
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary flex-1 py-4 disabled:opacity-50 text-base"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="w-6 h-6" />
              Record Sale
            </>
          )}
        </button>
      </div>
    </div>
  );
}