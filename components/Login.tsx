
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, LogIn, ShieldCheck, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Portal Hub</h1>
          <p className="text-indigo-100 mt-2">Welcome back, please log in</p>
        </div>
        
        <form onSubmit={handleAuth} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
          >
            {loading ? (
              <span className="animate-pulse">Accessing...</span>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Access Portal
              </>
            )}
          </button>

          <div className="text-center pt-6 space-y-2">
            <p className="text-sm text-slate-600 font-medium">
              If you want to create your account contact owner.
            </p>
            <a 
              href="https://baralaayush.com.np/#contact" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-all hover:scale-105 active:scale-95"
            >
              <span role="img" aria-label="point-right">👉</span> Send Message
            </a>
          </div>
        </form>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            SECURE PORTAL ACCESS
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
