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
import { getDisplayName } from '@/lib/display-name';
import { Currency, formatCurrencyTotals } from '@/lib/currency';

export default function OverviewPage() {
  const router = useRouter();
  const { invoices, loading, user, settings } = useApp();
  const displayName = getDisplayName(user?.email, settings.companyName);

  // Dynamic calculations based on live invoices list
  const totalInvoicesCount = invoices.length;

  const sumByCurrency = (statusFilter: (typeof invoices)[number]['status']) => {
    const totals: Partial<Record<Currency, number>> = {};
    invoices
      .filter(inv => inv.status === statusFilter)
      .forEach(inv => {
        totals[inv.currency] = (totals[inv.currency] || 0) + inv.totalUsd;
      });
    return totals;
  };

  const totalPaid = sumByCurrency('paid');
  const totalPending = sumByCurrency('sent');
  const totalOverdue = sumByCurrency('overdue');

  // Currencies actually used across the account's invoices, for chart legends
  const activeCurrencies = Array.from(new Set(invoices.map(inv => inv.currency))) as Currency[];

  // Dynamic monthly income grouping (12 months of the current year) for the Bar Chart
  const FR_MONTH_ABBREVIATIONS = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
  ];

  const getMonthlyIncome = () => {
    const currentYear = new Date().getFullYear();
    const yearSuffix = String(currentYear).slice(-2);
    const monthlyTotals: { USD: number; EUR: number }[] = Array.from({ length: 12 }, () => ({ USD: 0, EUR: 0 }));

    invoices.forEach(inv => {
      if (inv.status === 'draft') return;
      const parts = inv.issueDate.split('/');
      if (parts.length === 3) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (year === currentYear && monthIndex >= 0 && monthIndex < 12) {
          monthlyTotals[monthIndex][inv.currency] += inv.totalUsd;
        }
      }
    });

    return FR_MONTH_ABBREVIATIONS.map((label, idx) => ({
      month: `${label} ${yearSuffix}`,
      USD: monthlyTotals[idx].USD,
      EUR: monthlyTotals[idx].EUR,
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
    const clientMap: { [key: string]: { name: string; totals: Partial<Record<Currency, number>>; count: number } } = {};
    invoices.forEach(inv => {
      if (inv.status === 'draft') return;
      if (!clientMap[inv.client.name]) {
        clientMap[inv.client.name] = { name: inv.client.name, totals: {}, count: 0 };
      }
      const entry = clientMap[inv.client.name];
      entry.totals[inv.currency] = (entry.totals[inv.currency] || 0) + inv.totalUsd;
      entry.count += 1;
    });

    const sumAllCurrencies = (totals: Partial<Record<Currency, number>>) =>
      Object.values(totals).reduce((sum: number, v) => sum + (v || 0), 0);

    return Object.values(clientMap)
      .sort((a, b) => sumAllCurrencies(b.totals) - sumAllCurrencies(a.totals))
      .slice(0, 4)
      .map((c, idx) => ({
        id: String(idx + 1),
        name: c.name,
        totals: c.totals,
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
          subtitle="Volume total d'activité"
          icon={FileText}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <StatCard
          title="Revenu payé"
          valueUsd={formatCurrencyTotals(totalPaid)}
          growth={{ value: 14.5, isPositive: true }}
          icon={CheckCircle}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <StatCard
          title="Revenu en attente"
          valueUsd={formatCurrencyTotals(totalPending)}
          icon={Clock}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <StatCard
          title="Revenu en retard"
          valueUsd={formatCurrencyTotals(totalOverdue)}
          icon={AlertTriangle}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* Row 2: Income statistics & Status distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
        <div className="lg:col-span-2">
          <IncomeChart data={getMonthlyIncome()} activeCurrencies={activeCurrencies} />
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
