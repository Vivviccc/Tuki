import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, isConfigured, userProfile } = useAuth();

  const [email, setEmail] = useState('you@example.com');
  const [password, setPassword] = useState('password123');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (userProfile) {
      const from = (location.state as any)?.from?.pathname || '/groups';
      navigate(from, { replace: true });
    }
  }, [userProfile, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const res = await signIn(email, password);
    setSubmitting(false);

    if (res.success) {
      const from = (location.state as any)?.from?.pathname || '/groups';
      navigate(from, { replace: true });
    } else {
      setErrorMsg(res.message || 'Failed to sign in. Check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setGoogleSubmitting(true);
    const res = await signInWithGoogle();
    setGoogleSubmitting(false);

    if (res.success) {
      if (!isConfigured) {
        navigate('/groups');
      }
    } else {
      setErrorMsg(res.message || 'Google Auth failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md p-8 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-glow-brand">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to access your squad's private social maps</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 text-white text-xs border border-slate-800 focus:border-sky-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 text-white text-xs border border-slate-800 focus:border-sky-500 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-sm shadow-glow-brand transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Tuki</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold shrink-0">
            or continue with
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-medium text-xs transition-all flex items-center justify-center gap-3"
        >
          {googleSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Sign in with Google</span>
        </button>

        {!isConfigured && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
            <p className="text-[11px] font-semibold text-amber-400">
              ⚡ Demo Mode Active
            </p>
            <p className="text-[10px] text-amber-300/70">
              Supabase keys in <code className="text-amber-200 bg-amber-950/60 px-1 py-0.5 rounded">.env.local</code> will activate full live backend auth.
            </p>
          </div>
        )}

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-sky-400 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
