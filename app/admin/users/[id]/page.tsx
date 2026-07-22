'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, FileText, Wallet, Users2, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { Client, Invoice, Payment, Refund } from '@/types';
import AdminStatCard from '@/components/admin/AdminStatCard';
import InvoiceStatusChart from '@/components/admin/InvoiceStatusChart';

interface AdminUserDetail {
  id: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  createdAt: string;
}

interface SubscriptionInfo {
  planId: string;
  billingPeriod: string;
  status?: string;
  expiresAt: string;
}

interface UserData {
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  refunds: Refund[];
}

const PLANS = ['plan-starter', 'plan-pro', 'plan-business'];

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({ email: '', role: 'user' as 'user' | 'admin', status: 'active' as 'active' | 'suspended', password: '' });
  const [planId, setPlanId] = useState(PLANS[0]);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userInfo, sub, userData] = await Promise.all([
        apiFetch<AdminUserDetail>(`/api/admin/users/${id}`),
        apiFetch<SubscriptionInfo | null>(`/api/admin/users/${id}/subscription`),
        apiFetch<UserData>(`/api/admin/users/${id}/data`),
      ]);
      setUser(userInfo);
      setFormData({ email: userInfo.email, role: userInfo.role, status: userInfo.status, password: '' });
      setSubscription(sub);
      setData(userData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        email: formData.email,
        role: formData.role,
        status: formData.status,
      };
      if (formData.password) body.password = formData.password;

      await apiFetch(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setFormData((prev) => ({ ...prev, password: '' }));
      await load();
      alert('Compte mis à jour.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const activateSubscription = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/admin/users/${id}/subscription`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'activate', planId, billingPeriod }),
      });
      await load();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'activation.");
    } finally {
      setSaving(false);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm("Annuler l'abonnement actif de cet utilisateur ?")) return;
    setSaving(true);
    try {
      await apiFetch(`/api/admin/users/${id}/subscription`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'cancel' }),
      });
      await load();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'annulation.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center justify-center w-10 h-10 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-slate-800 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-extrabold text-slate-900">{user.email}</h1>
      </div>

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <AdminStatCard
            title="Facturé (total)"
            value={`$${data.invoices.reduce((sum, inv) => sum + inv.totalUsd, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={FileText}
            iconBgColor="bg-blue-50"
            iconTextColor="text-blue-600"
          />
          <AdminStatCard
            title="Encaissé (payé)"
            value={`$${data.invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalUsd, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={CheckCircle2}
            iconBgColor="bg-emerald-50"
            iconTextColor="text-emerald-600"
          />
          <AdminStatCard
            title="Clients"
            value={String(data.clients.length)}
            icon={Users2}
            iconBgColor="bg-amber-50"
            iconTextColor="text-amber-600"
          />
          <AdminStatCard
            title="Factures"
            value={String(data.invoices.length)}
            icon={Wallet}
            iconBgColor="bg-purple-50"
            iconTextColor="text-purple-600"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account edit form */}
        <form onSubmit={handleSaveUser} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3">Compte</h3>
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Rôle</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value as 'user' | 'admin' }))}
                className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary"
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as 'active' | 'suspended' }))}
                className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary"
              >
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Nouveau mot de passe (laisser vide pour ne pas changer)
            </label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 h-11 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>
        </form>

        {/* Subscription management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3">Abonnement</h3>
          {subscription ? (
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Plan :</span> {subscription.planId}</p>
              <p><span className="font-semibold">Facturation :</span> {subscription.billingPeriod}</p>
              <p><span className="font-semibold">Expire le :</span> {new Date(subscription.expiresAt).toLocaleDateString('fr-FR')}</p>
              <button
                onClick={cancelSubscription}
                disabled={saving}
                className="mt-2 w-full h-11 text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl disabled:opacity-50"
              >
                Annuler l&apos;abonnement
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Aucun abonnement actif.</p>
          )}

          <div className="border-t border-slate-50 pt-4 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activer manuellement</p>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary"
              >
                {PLANS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value as 'monthly' | 'yearly')}
                className="h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary"
              >
                <option value="monthly">Mensuel</option>
                <option value="yearly">Annuel</option>
              </select>
            </div>
            <button
              onClick={activateSubscription}
              disabled={saving}
              className="w-full h-11 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl disabled:opacity-50"
            >
              Activer / Remplacer
            </button>
          </div>
        </div>
      </div>

      {/* Read-only data tables */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InvoiceStatusChart invoices={data.invoices} />

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Clients ({data.clients.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.clients.map((c) => (
                <div key={c.id} className="text-sm flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-700">{c.name}</span>
                  <span className="text-slate-400">{c.email}</span>
                </div>
              ))}
              {data.clients.length === 0 && <p className="text-xs text-slate-400">Aucun client.</p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Factures ({data.invoices.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.invoices.map((inv) => (
                <div key={inv.id} className="text-sm flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-700">{inv.invoiceNumber}</span>
                  <span className="text-slate-400">${inv.totalUsd.toLocaleString()} · {inv.status}</span>
                </div>
              ))}
              {data.invoices.length === 0 && <p className="text-xs text-slate-400">Aucune facture.</p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Paiements ({data.payments.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.payments.map((p) => (
                <div key={p.id} className="text-sm flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-700">{p.invoiceNumber}</span>
                  <span className="text-slate-400">${p.amountUsd.toLocaleString()} · {p.method}</span>
                </div>
              ))}
              {data.payments.length === 0 && <p className="text-xs text-slate-400">Aucun paiement.</p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Remboursements ({data.refunds.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.refunds.map((r) => (
                <div key={r.id} className="text-sm flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-700">{r.invoiceNumber}</span>
                  <span className="text-slate-400">${r.amountUsd.toLocaleString()} · {r.status}</span>
                </div>
              ))}
              {data.refunds.length === 0 && <p className="text-xs text-slate-400">Aucun remboursement.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
