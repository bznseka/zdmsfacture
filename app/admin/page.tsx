'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Ban, CheckCircle, Trash2, Loader2, Users, UserCheck, UserX, CreditCard } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import AdminStatCard from '@/components/admin/AdminStatCard';
import SignupsChart from '@/components/admin/SignupsChart';
import PlanDistributionChart from '@/components/admin/PlanDistributionChart';

interface AdminUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  createdAt: string;
  subscription: { planId: string; billingPeriod: string; expiresAt: string } | null;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  activeSubscriptionsCount: number;
  totalRevenueUsd: number;
  planDistribution: Record<string, number>;
  signupsByMonth: { month: string; count: number }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        apiFetch<AdminUser[]>('/api/admin/users'),
        apiFetch<AdminStats>('/api/admin/stats'),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (user: AdminUser) => {
    setBusyId(user.id);
    try {
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: user.status === 'active' ? 'suspended' : 'active' }),
      });
      await load();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour du statut.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`Supprimer définitivement le compte ${user.email} et toutes ses données ?`)) return;
    setBusyId(user.id);
    try {
      await apiFetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Utilisateurs</h1>
          <p className="text-sm text-slate-500 mt-1">{users.length} compte(s) inscrit(s)</p>
        </div>
        <Link
          href="/admin/users/new"
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un utilisateur</span>
        </Link>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <AdminStatCard
              title="Total utilisateurs"
              value={String(stats.totalUsers)}
              icon={Users}
              iconBgColor="bg-blue-50"
              iconTextColor="text-blue-600"
            />
            <AdminStatCard
              title="Comptes actifs"
              value={String(stats.activeUsers)}
              icon={UserCheck}
              iconBgColor="bg-emerald-50"
              iconTextColor="text-emerald-600"
            />
            <AdminStatCard
              title="Comptes suspendus"
              value={String(stats.suspendedUsers)}
              icon={UserX}
              iconBgColor="bg-rose-50"
              iconTextColor="text-rose-600"
            />
            <AdminStatCard
              title="Abonnements actifs"
              value={String(stats.activeSubscriptionsCount)}
              icon={CreditCard}
              iconBgColor="bg-amber-50"
              iconTextColor="text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SignupsChart data={stats.signupsByMonth} />
            <PlanDistributionChart planCounts={stats.planDistribution} />
          </div>
        </>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Rôle</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3">Abonnement</th>
                <th className="px-6 py-3">Inscrit le</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    <Link href={`/admin/users/${user.id}`} className="hover:text-primary">
                      {user.email}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                      {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {user.status === 'active' ? 'Actif' : 'Suspendu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {user.subscription ? `${user.subscription.planId} (${user.subscription.billingPeriod})` : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        disabled={busyId === user.id}
                        onClick={() => toggleStatus(user)}
                        title={user.status === 'active' ? 'Suspendre' : 'Réactiver'}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {user.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        disabled={busyId === user.id}
                        onClick={() => deleteUser(user)}
                        title="Supprimer"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
