import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import {
  Store,
  User,
  Lock,
  Bell,
  Shield,
  ChevronRight,
  Loader2,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function Settings() {
  const { user, updateProfile, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    storeName: user?.storeName || '',
    currency: user?.currency || '₦',
    lowStockThreshold: user?.lowStockThreshold || 10,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        ...profileForm,
        lowStockThreshold: parseInt(profileForm.lowStockThreshold),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const settingsItems = [
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      subtitle: user?.name,
    },
    {
      id: 'store',
      icon: Store,
      label: 'Store Settings',
      subtitle: user?.storeName,
    },
    {
      id: 'password',
      icon: Lock,
      label: 'Change Password',
      subtitle: '••••••••',
    },
  ];

  if (activeSection === 'profile') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSection(null)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
          </button>
          <h1 className="page-title">Profile</h1>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <p className="text-sm text-emerald-700">Saved!</p>
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="input-field bg-gray-50 text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    );
  }

  if (activeSection === 'store') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSection(null)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
          </button>
          <h1 className="page-title">Store Settings</h1>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <p className="text-sm text-emerald-700">Saved!</p>
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={profileForm.storeName}
                onChange={(e) => setProfileForm({ ...profileForm, storeName: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
              <select
                value={profileForm.currency}
                onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                className="input-field"
              >
                <option value="₦">₦ (Naira)</option>
                <option value="$">$ (Dollar)</option>
                <option value="€">€ (Euro)</option>
                <option value="£">£ (Pound)</option>
                <option value="₹">₹ (Rupee)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={profileForm.lowStockThreshold}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, lowStockThreshold: e.target.value })
                }
                className="input-field"
                min="1"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Products with stock below this number will be flagged
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    );
  }

  if (activeSection === 'password') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSection(null)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
          </button>
          <h1 className="page-title">Change Password</h1>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <p className="text-sm text-emerald-700">Password changed!</p>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="input-field"
                required
                minLength="6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="input-field"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Change Password'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="page-title">Settings</h1>

      {/* User Card */}
      <div className="card flex items-center gap-4">
        <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-xl font-bold text-primary-700">
            {user?.name?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="font-bold text-gray-900">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-xs text-primary-600 font-medium">{user?.storeName}</p>
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-2">
        {settingsItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className="card w-full flex items-center gap-4 text-left hover:border-primary-300 transition-colors"
          >
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              <item.icon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.subtitle}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="card w-full flex items-center gap-4 text-left text-red-600 hover:bg-red-50 transition-colors"
      >
        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
          <Lock className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Logout</p>
          <p className="text-xs text-red-400">Sign out of your account</p>
        </div>
      </button>

      {/* App Info */}
      <div className="text-center pt-4">
        <p className="text-xs text-gray-400">StockFlow v1.0</p>
        <p className="text-xs text-gray-300">Inventory Management PWA</p>
      </div>
    </div>
  );
}