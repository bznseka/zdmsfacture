'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

export default function NewAdminUserPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center justify-center w-10 h-10 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-slate-800 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-extrabold text-slate-900">Créer un utilisateur</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Mot de passe
          </label>
          <input
            type="text"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Rôle
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
            className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary"
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 h-11 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>Créer le compte</span>
        </button>
      </form>
    </div>
  );
}
