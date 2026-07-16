import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  ArrowLeft,
  Camera,
  Loader2,
  Check,
  Package,
  Tag,
  Hash,
  Scale,
  DollarSign,
  FileText,
  X,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Detect if user is on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
    };
    checkMobile();
  }, []);

  const [form, setForm] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'pieces',
    costPrice: '',
    sellingPrice: '',
    description: '',
  });

  const units = [
    'pieces',
    'kg',
    'liters',
    'bags',
    'boxes',
    'cartons',
    'dozens',
    'pairs',
    'sets',
  ];

  const categories = [
    'Food & Beverages',
    'Electronics',
    'Clothing',
    'Household',
    'Beauty',
    'Other',
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (file) => {
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
    setShowPicker(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
    // Reset so the same file can be selected again if needed
    e.target.value = '';
  };

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const openGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const removeImage = () => {
    setPreview(null);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category || 'Uncategorized');
      formData.append('quantity', form.quantity);
      formData.append('unit', form.unit);
      formData.append('costPrice', form.costPrice);
      formData.append('sellingPrice', form.sellingPrice);
      formData.append('description', form.description || '');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm({
          name: '',
          category: '',
          quantity: '',
          unit: 'pieces',
          costPrice: '',
          sellingPrice: '',
          description: '',
        });
        setPreview(null);
        setImageFile(null);
      }, 2000);
    } catch (error) {
      console.error('Add product error:', error);
      alert(error.response?.data?.message || error.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const profit =
    form.costPrice && form.sellingPrice
      ? parseFloat(form.sellingPrice) - parseFloat(form.costPrice)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Add Product</h1>
            <p className="text-xs text-gray-400">Fill in product details</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Success */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-emerald-700">Product Added!</p>
              <p className="text-sm text-emerald-600">Stock updated successfully</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Product Image
            </label>
            {preview ? (
              <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="flex flex-col items-center justify-center w-full h-56 bg-white border-2 border-dashed border-gray-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/30 cursor-pointer transition-all group"
              >
                <div className="w-14 h-14 bg-gray-100 group-hover:bg-emerald-100 rounded-2xl flex items-center justify-center mb-3 transition-colors">
                  <Camera className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <span className="text-sm font-medium text-gray-500 group-hover:text-emerald-600 transition-colors">
                  Tap to upload image
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Camera or Gallery
                </span>
              </button>
            )}
          </div>

          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Basic Info
            </h3>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Product Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="e.g., Rice 50kg"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Select or type category"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Stock Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Stock
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Quantity <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Unit
                </label>
                <div className="relative">
                  <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>
                        {u.charAt(0).toUpperCase() + u.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Pricing
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Cost Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cost Price <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="costPrice"
                    value={form.costPrice}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Selling Price <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="sellingPrice"
                    value={form.sellingPrice}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Profit Preview */}
            {profit > 0 && (
              <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm text-emerald-700 font-medium">
                  Profit per unit
                </span>
                <span className="text-sm font-bold text-emerald-700">
                  ₦{profit.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Description
            </h3>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                placeholder="Optional product details..."
                rows={3}
              />
            </div>
          </div>

          {/* Desktop Submit Button */}
          <div className="hidden md:block">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Sticky Bottom Button */}
      <div className="md:hidden fixed bottom-[72px] left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Package className="w-5 h-5" />
                Add Product
              </>
            )}
          </button>
        </div>
      </div>

      {/* ===== Image Picker Bottom Sheet ===== */}
      {showPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowPicker(false)}
          />
          {/* Sheet */}
          <div 
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#1c1c1e] rounded-t-3xl px-4 pt-4 pb-8"
            style={{
              animation: 'slideUp 0.25s ease-out',
            }}
          >
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
            <div className="space-y-2">
              <button
                type="button"
                onClick={openCamera}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#2c2c2e] hover:bg-[#3a3a3c] transition-colors text-left"
              >
                <div className="w-10 h-10 bg-[#3a3a3c] rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-base font-medium">Camera</span>
              </button>

              <button
                type="button"
                onClick={openGallery}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#2c2c2e] hover:bg-[#3a3a3c] transition-colors text-left"
              >
                <div className="w-10 h-10 bg-[#3a3a3c] rounded-full flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-base font-medium">Photos</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="w-full mt-4 p-4 rounded-2xl bg-[#2c2c2e] hover:bg-[#3a3a3c] transition-colors text-center"
            >
              <span className="text-emerald-400 text-base font-semibold">Cancel</span>
            </button>
          </div>
        </>
      )}

      {/* Hidden file inputs - Camera input with capture for mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        className="hidden"
      />
      {/* Hidden file inputs - Gallery input without capture */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
}