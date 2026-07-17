import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import {
  Store,
  User,
  Lock,
  ChevronRight,
  Loader2,
  Check,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Type,
  Coins,
  AlertTriangle,
  LogOut,
  Shield,
  Sparkles,
  X,
  Save,
  KeyRound,
} from 'lucide-react';

import AIInsights from '../pages/AIInsights';

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

  const currencies = [
    { value: '₦', label: '₦ Naira' },
    { value: '$', label: '$ Dollar' },
    { value: '€', label: '€ Euro' },
    { value: '£', label: '£ Pound' },
    { value: '₹', label: '₹ Rupee' },
  ];

  // ============ SUB PAGES ============

  if (activeSection === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50 pb-28 md:pb-8">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => setActiveSection(null)}
              className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Profile</h1>
              <p className="text-xs text-gray-400">Update your personal info</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-emerald-700">Saved!</p>
                <p className="text-sm text-emerald-600">Profile updated successfully</p>
              </div>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Personal Info
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 ml-1">Email cannot be changed</p>
              </div>
            </div>

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
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Sticky Button */}
        <div className="md:hidden fixed bottom-[72px] left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <button
              onClick={handleProfileUpdate}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'store') {
    return (
      <div className="min-h-screen bg-gray-50 pb-28 md:pb-8">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => setActiveSection(null)}
              className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Store Settings</h1>
              <p className="text-xs text-gray-400">Manage your store preferences</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-emerald-700">Saved!</p>
                <p className="text-sm text-emerald-600">Store settings updated</p>
              </div>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Store Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Store Name
                </label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileForm.storeName}
                    onChange={(e) => setProfileForm({ ...profileForm, storeName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Your store name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Currency
                </label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={profileForm.currency}
                    onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                    className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none"
                  >
                    {currencies.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Low Stock Alert Threshold
                </label>
                <div className="relative">
                  <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={profileForm.lowStockThreshold}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, lowStockThreshold: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    min="1"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 ml-1">
                  Products below this number will show a low stock warning
                </p>
              </div>
            </div>

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
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Sticky Button */}
        <div className="md:hidden fixed bottom-[72px] left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <button
              onClick={handleProfileUpdate}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'password') {
    return (
      <div className="min-h-screen bg-gray-50 pb-28 md:pb-8">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => setActiveSection(null)}
              className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Change Password</h1>
              <p className="text-xs text-gray-400">Secure your account</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-emerald-700">Password Changed!</p>
                <p className="text-sm text-emerald-600">Your account is now more secure</p>
              </div>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Security
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Min 6 characters"
                    required
                    minLength="6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
              </div>
            </div>

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
                    <Lock className="w-5 h-5" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Sticky Button */}
        <div className="md:hidden fixed bottom-[72px] left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <button
              onClick={handlePasswordChange}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ AI INSIGHTS SUB PAGE ============

  if (activeSection === 'ai') {
    return <AIInsights onBack={() => setActiveSection(null)} />;
  }

  // ============ MAIN SETTINGS PAGE ============

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage your account and preferences</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-emerald-700">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 text-lg truncate">{user?.name}</h2>
            <p className="text-sm text-gray-400 truncate">{user?.email}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">{user?.storeName}</p>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          {/* Account Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 px-1">
              Account
            </h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
              <button
                onClick={() => setActiveSection('profile')}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors group"
              >
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">Profile</p>
                  <p className="text-sm text-gray-400 truncate">{user?.name}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
              </button>

              <button
                onClick={() => setActiveSection('store')}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors group"
              >
                <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
                  <Store className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">Store Settings</p>
                  <p className="text-sm text-gray-400 truncate">{user?.storeName || 'Not set'}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
              </button>

              <button
                onClick={() => setActiveSection('password')}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors group"
              >
                <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                  <Lock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-400">Update your security</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
              </button>

              {/* AI Insights Button */}
              <button
                onClick={() => setActiveSection('ai')}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors group"
              >
                <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">AI Insights</p>
                  <p className="text-sm text-gray-400">Gemini-powered daily analysis</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 px-1">
              Danger Zone
            </h3>
            <button
              onClick={logout}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 text-left hover:bg-red-50 hover:border-red-100 transition-all group"
            >
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                <LogOut className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-600">Logout</p>
                <p className="text-sm text-red-400">Sign out of your account</p>
              </div>
              <ChevronRight className="w-5 h-5 text-red-300 group-hover:text-red-500 transition-colors flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <p className="text-xs text-gray-400 font-medium">StockFlow v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}