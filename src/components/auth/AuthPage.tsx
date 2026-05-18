import { useState } from 'react';
import { TrendingUp, Eye, EyeOff, Lock, Mail, User, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<{ error: unknown }>;
  onSignUp: (email: string, password: string, fullName: string) => Promise<{ error: unknown }>;
}

export function AuthPage({ onSignIn, onSignUp }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'login') {
      const { error: err } = await onSignIn(email, password);
      if (err) setError((err as { message?: string }).message ?? 'Login failed');
    } else {
      if (!fullName.trim()) { setError('Full name is required'); setLoading(false); return; }
      const { error: err } = await onSignUp(email, password, fullName);
      if (err) setError((err as { message?: string }).message ?? 'Registration failed');
      else setSuccess('Account created! Please check your email or sign in.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-emerald-400 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-blue-400 blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={22} className="text-white" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">TradeX</span>
          </div>
        </div>
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Trade the world's<br />
              <span className="text-emerald-400">most popular</span><br />
              markets
            </h2>
            <p className="mt-4 text-gray-400 text-lg leading-relaxed">
              Access 2,000+ instruments including forex, crypto, indices, and commodities with ultra-low spreads.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Active Traders', value: '800K+' },
              { label: 'Countries', value: '190+' },
              { label: 'Instruments', value: '2000+' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-emerald-400">{stat.value}</div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="flex gap-4">
            {['FCA', 'CySEC', 'FSCA', 'FSA'].map(reg => (
              <div key={reg} className="text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                {reg} Regulated
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="text-white text-xl font-bold">TradeX</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-gray-400 mt-2">
              {mode === 'login' ? 'Sign in to your trading account' : 'Start trading in minutes'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-900 rounded-xl p-1 mb-8">
            {(['login', 'register'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === tab
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{' '}
              <button onClick={() => setMode('register')} className="text-emerald-400 hover:text-emerald-300 font-medium">
                Register now
              </button>
            </p>
          )}

          <p className="text-center text-gray-600 text-xs mt-8 leading-relaxed">
            By continuing you agree to our{' '}
            <span className="text-gray-400">Terms of Service</span> and{' '}
            <span className="text-gray-400">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
