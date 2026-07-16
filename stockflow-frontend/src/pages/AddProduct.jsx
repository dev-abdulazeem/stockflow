import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Camera, Loader2, Check } from 'lucide-react';

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'pieces',
    costPrice: '',
    sellingPrice: '',
    description: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="page-title">Add Product</h1>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-emerald-700">Product added successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
          <div className="relative">
            {preview ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white text-lg"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 cursor-pointer transition-colors">
                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Tap to upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Rice 50kg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Food, Electronics"
              list="categories"
            />
            <datalist id="categories">
              <option value="Food & Beverages" />
              <option value="Electronics" />
              <option value="Clothing" />
              <option value="Household" />
              <option value="Beauty" />
              <option value="Other" />
            </datalist>
          </div>
        </div>

        {/* Stock Info */}
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select name="unit" value={form.unit} onChange={handleChange} className="input-field">
                <option value="pieces">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="liters">Liters</option>
                <option value="bags">Bags</option>
                <option value="boxes">Boxes</option>
                <option value="cartons">Cartons</option>
                <option value="dozens">Dozens</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price *</label>
              <input
                type="number"
                name="costPrice"
                value={form.costPrice}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
              <input
                type="number"
                name="sellingPrice"
                value={form.sellingPrice}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          {form.costPrice && form.sellingPrice && (
            <p className="text-xs text-primary-600 font-medium">
              Profit per unit: ₦{(parseFloat(form.sellingPrice) - parseFloat(form.costPrice)).toFixed(2)}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input-field min-h-[80px] resize-none"
            placeholder="Optional product details..."
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Product'}
        </button>
      </form>
    </div>
  );
}