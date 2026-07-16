import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, Eye, EyeOff, Loader2, ShoppingBag } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
  });
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password, form.storeName);
      } else {
        await login(form.email, form.password);
      }
      navigate('/');
    } catch {
      // error handled by store
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex items-center justify-center fixed inset-0">
      <div className="w-full max-w-[400px] px-4 sm:px-6 overflow-y-auto max-h-screen">
        {/* Logo Section */}
        <div className="text-center mb-6 pt-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-emerald-200">
            <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
            STOCKFLOW
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Manage your shop smarter
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 pb-8">
          {/* Heading */}
          <div className="text-center mb-5 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {isRegister ? 'Create Account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {isRegister ? 'Set up your store' : 'Login to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Full Name - Register only */}
            {isRegister && (
              <div>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Full Name"
                    required
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Store Name - Register only */}
            {isRegister && (
              <div>
                <div className="relative">
                  <input
                    type="text"
                    name="storeName"
                    value={form.storeName}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Store Name"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Email"
                  required
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Password"
                  required
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password - Login only */}
            {!isRegister && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-2xl text-center">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : isRegister ? (
                'Create Account'
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-gray-500 mt-5 sm:mt-6 pb-4">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                clearError();
              }}
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              {isRegister ? 'Sign In' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}