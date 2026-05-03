import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isFirebaseConfigured || !auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-2">Admin sign in</h2>
          <p className="text-sm text-rose-300 mb-6">Firebase is not configured. Please set the env variables in .env.local and restart the dev server.</p>
          <button type="button" onClick={() => window.location.assign('/')} className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20">
            Back to site
          </button>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Admin sign in</h2>
        <p className="text-sm text-slate-400 mb-6">Sign in with your admin account to manage portfolio content.</p>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none" />
          </label>

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <div className="flex items-center justify-between">
            <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20">
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
            <button type="button" onClick={() => window.location.assign('/')} className="text-sm text-slate-400 hover:underline">Back to site</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
