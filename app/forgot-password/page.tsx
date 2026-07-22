'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Wallet, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
      } else {
        setMessage(data.message);
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4 md:p-6 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-2xl p-8 z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 text-white shadow-lg shadow-primary/20 mb-4">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mot de passe oublié</h1>
          <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase mt-1 text-center">
            Recevez un lien de réinitialisation par email
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Adresse E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="block w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Envoyer le lien de réinitialisation'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
