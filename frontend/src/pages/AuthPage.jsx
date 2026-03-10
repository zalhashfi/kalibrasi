import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await authApi.login(email, password);
      login(result.data.user, result.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authApi.register(regName, regEmail, regPassword);
      setSuccess('Registration successful! You can now login.');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setTimeout(() => {
        setIsLogin(true);
        setSuccess('');
      }, 2000);
    } catch (err) {
      if (err.errors) {
        setError(err.errors.map(e => e.msg).join(', '));
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  const inputClass =
    'w-full px-4 py-3 bg-surface-input border border-border-default rounded-lg text-slate-100 text-[0.9375rem] outline-none transition-all duration-150 placeholder:text-slate-600 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15';

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-15 bg-blue-500 -top-[200px] -right-[200px] animate-float" />
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-15 bg-cyan-400 -bottom-[200px] -left-[200px] animate-float-delayed" />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-15 bg-blue-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-delayed-2" />
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-gray-900/80 backdrop-blur-3xl border border-white/5 rounded-2xl p-10 shadow-2xl max-md:p-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-2xl">
            📡
          </div>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-slate-100 to-blue-300 bg-clip-text text-transparent">
            Kalibrasi
          </span>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-bold text-slate-100 mb-1">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-slate-500 text-sm mb-8">
          {isLogin
            ? 'Sign in to access your sensor dashboard'
            : 'Register to start monitoring your devices'}
        </p>

        {/* Alerts */}
        {error && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2.5 mb-4 animate-slide-down bg-red-500/8 text-red-400 border border-red-500/20" id="auth-error">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2.5 mb-4 animate-slide-down bg-green-500/8 text-green-400 border border-green-500/20" id="auth-success">
            ✅ {success}
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLogin} id="login-form">
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className={inputClass}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className={inputClass}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 hover:shadow-[0_0_20px_rgba(51,120,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} id="register-form">
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide" htmlFor="register-name">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                className={inputClass}
                placeholder="Enter your full name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide" htmlFor="register-email">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                className={inputClass}
                placeholder="Enter your email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                className={inputClass}
                placeholder="Create a password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 hover:shadow-[0_0_20px_rgba(51,120,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              id="register-submit"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

        {/* Switch mode */}
        <div className="text-center mt-6 text-sm text-slate-500">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button onClick={switchMode} id="switch-to-register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors bg-transparent border-none cursor-pointer">
                Register here
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={switchMode} id="switch-to-login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors bg-transparent border-none cursor-pointer">
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
