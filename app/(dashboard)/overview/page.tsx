'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import IncomeChart from '@/components/dashboard/IncomeChart';
import DonutChart from '@/components/dashboard/DonutChart';
import InvoiceTable from '@/components/dashboard/InvoiceTable';
import TopClients from '@/components/dashboard/TopClients';
import { useApp } from '@/context/AppContext';

const DEFAULT_COMPANY_NAME = 'Ma Société';

function getDisplayName(email: string | null | undefined, companyName: string): string {
  if (companyName && companyName !== DEFAULT_COMPANY_NAME) {
    return companyName;
  }
  if (email) {
    const localPart = email.split('@')[0];
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }
  return '';
}

export default function OverviewPage() {
  const router = useRouter();
  const { invoices, exchangeRate, loading, user, settings } = useApp();
  const displayName = getDisplayName(user?.email, settings.companyName);

  // Dynamic calculations based on live invoices list
  const totalInvoicesCount = invoices.length;
  
  const totalPaidUsd = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalUsd, 0);

  const totalPendingUsd = invoices
    .filter(inv => inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.totalUsd, 0);

  const totalOverdueUsd = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.totalUsd, 0);

  // Dynamic monthly income grouping (Jan - Jun 2026) for the Bar Chart
  const getMonthlyIncome = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const incomeMap = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0 };
    
    invoices.forEach(inv => {
      if (inv.status === 'draft') return;
      const parts = inv.issueDate.split('/');
      if (parts.length === 3) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (year === 2026 && monthIndex >= 0 && monthIndex < 6) {
          const name = months[monthIndex] as keyof typeof incomeMap;
          if (incomeMap[name] !== undefined) {
            incomeMap[name] += inv.totalUsd;
          }
        }
      }
    });

    return months.map(m => ({
      month: m,
      income: incomeMap[m as keyof typeof incomeMap] || 0
    }));
  };

  // Dynamic status distribution for Donut Chart
  const getStatusPercentage = () => {
    const counts = { paid: 0, sent: 0, overdue: 0, draft: 0 };
    invoices.forEach(inv => {
      counts[inv.status] += 1;
    });
    const total = invoices.length || 1;
    return [
      { name: 'Payées', value: Math.round((counts.paid / total) * 100), color: '#22C55E' },
      { name: 'Envoyées', value: Math.round((counts.sent / total) * 100), color: '#F59E0B' },
      { name: 'En retard', value: Math.round((counts.overdue / total) * 100), color: '#EF4444' },
      { name: 'Brouillons', value: Math.round((counts.draft / total) * 100), color: '#9CA3AF' },
    ];
  };

  // Dynamic Top Clients ranking
  const getTopClients = () => {
    const clientMap: { [key: string]: { name: string; totalUsd: number; count: number } } = {};
    invoices.forEach(inv => {
      if (inv.status === 'draft') return;
      if (!clientMap[inv.client.name]) {
        clientMap[inv.client.name] = { name: inv.client.name, totalUsd: 0, count: 0 };
      }
      clientMap[inv.client.name].totalUsd += inv.totalUsd;
      clientMap[inv.client.name].count += 1;
    });

    return Object.values(clientMap)
      .sort((a, b) => b.totalUsd - a.totalUsd)
      .slice(0, 4)
      .map((c, idx) => ({
        id: String(idx + 1),
        name: c.name,
        totalUsd: c.totalUsd,
        totalCdf: c.totalUsd * exchangeRate,
        invoicesCount: c.count,
        initials: c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-scale-in opacity-0 [animation-fill-mode:forwards]">
      {/* Page Header / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms]">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bonjour {displayName} !
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
            Voici l&apos;état de vos finances pour aujourd&apos;hui.
          </p>
        </div>

        {/* Quick action button linked to creation */}
        <button 
          onClick={() => router.push('/invoices/new')}
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-2xl shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Créer une facture</span>
        </button>
      </div>

      {/* 4 StatCards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
        <StatCard
          title="Factures émises"
          valueUsd={`${totalInvoicesCount} factures`}
          valueCdf="Volume total d'activité"
          icon={FileText}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <StatCard
          title="Revenu payé"
          valueUsd={`$${totalPaidUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          valueCdf={`${Math.round(totalPaidUsd * exchangeRate).toLocaleString('fr-FR')} FC`}
          growth={{ value: 14.5, isPositive: true }}
          icon={CheckCircle}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <StatCard
          title="Revenu en attente"
          valueUsd={`$${totalPendingUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          valueCdf={`${Math.round(totalPendingUsd * exchangeRate).toLocaleString('fr-FR')} FC`}
          icon={Clock}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <StatCard
          title="Revenu en retard"
          valueUsd={`$${totalOverdueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          valueCdf={`${Math.round(totalOverdueUsd * exchangeRate).toLocaleString('fr-FR')} FC`}
          icon={AlertTriangle}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* Row 2: Income statistics & Status distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
        <div className="lg:col-span-2">
          <IncomeChart data={getMonthlyIncome()} />
        </div>
        <div>
          <DonutChart data={getStatusPercentage()} />
        </div>
      </div>

      {/* Row 3: Invoices table & Top Clients list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:400ms]">
        <div className="lg:col-span-2">
          <InvoiceTable invoices={invoices.slice(0, 5)} />
        </div>
        <div>
          <TopClients clients={getTopClients()} />
        </div>
      </div>
    </div>
  );
}
