'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Search, Plus, Eye, Download, Trash2 } from 'lucide-react';
import { QuoteStatus } from '@/types';
import { formatCurrency } from '@/lib/currency';

export default function QuotesPage() {
  const router = useRouter();
  const { quotes, deleteQuote } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch = quote.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quote.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'accepted':
        return { label: 'Accepté', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80' };
      case 'sent':
        return { label: 'Envoyé', classes: 'bg-amber-50 text-amber-700 border-amber-200/80' };
      case 'rejected':
        return { label: 'Refusé', classes: 'bg-rose-50 text-rose-700 border-rose-200/80' };
      case 'draft':
      default:
        return { label: 'Brouillon', classes: 'bg-slate-100 text-slate-700 border-slate-200/80' };
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, number: string) => {
    e.stopPropagation();
    if (confirm(`Êtes-vous sûr de vouloir supprimer le devis ${number} ?`)) {
      try {
        await deleteQuote(id);
        alert('Devis supprimé avec succès.');
      } catch (err) {
        console.error(err);
        alert('Une erreur est survenue lors de la suppression.');
      }
    }
  };

  const statusTabs: { value: QuoteStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'draft', label: 'Brouillons' },
    { value: 'sent', label: 'Envoyés' },
    { value: 'accepted', label: 'Acceptés' },
    { value: 'rejected', label: 'Refusés' },
  ];

  return (
    <div className="space-y-8 animate-scale-in opacity-0 [animation-fill-mode:forwards]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms]">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Devis
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
            Créez et suivez vos propositions commerciales pour vos clients professionnels.
          </p>
        </div>

        <Link
          href="/quotes/new"
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-2xl shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] group self-start sm:self-auto"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Créer un devis</span>
        </Link>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex overflow-x-auto gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto md:max-w-max no-scrollbar">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`
                  px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 whitespace-nowrap
                  ${statusFilter === tab.value
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par client ou N° devis..."
              className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
        <div className="overflow-x-auto">
          {filteredQuotes.length > 0 ? (
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 whitespace-nowrap">N° Devis</th>
                  <th className="px-6 py-4 whitespace-nowrap">Client</th>
                  <th className="px-6 py-4 whitespace-nowrap">Émission</th>
                  <th className="px-6 py-4 whitespace-nowrap">Valide jusqu&apos;au</th>
                  <th className="px-6 py-4 whitespace-nowrap">Statut</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Montant</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredQuotes.map((quote) => {
                  const { label, classes } = getStatusBadge(quote.status);
                  return (
                    <tr
                      key={quote.id}
                      onClick={() => router.push(`/quotes/${quote.id}`)}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4.5 font-bold text-slate-900 whitespace-nowrap">
                        {quote.quoteNumber}
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{quote.client.name}</span>
                          <span className="text-xs text-slate-400 font-medium">{quote.client.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 font-medium whitespace-nowrap">
                        {quote.issueDate}
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 font-medium whitespace-nowrap">
                        {quote.validUntil}
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${classes}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right whitespace-nowrap">
                        <span className="font-bold text-slate-900">
                          {formatCurrency(quote.total, quote.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 opacity-85 group-hover:opacity-100 transition-opacity font-semibold">
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/quotes/${quote.id}`); }}
                            title="Voir les détails"
                            className="p-2 text-slate-500 hover:text-primary hover:bg-primary-light rounded-xl transition-all duration-150"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/quotes/${quote.id}?print=true`); }}
                            title="Télécharger/Imprimer PDF"
                            className="p-2 text-slate-500 hover:text-primary hover:bg-primary-light rounded-xl transition-all duration-150"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, quote.id, quote.quoteNumber)}
                            title="Supprimer le devis"
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-150"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mt-4">Aucun devis trouvé</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] text-center font-medium">
                Aucun devis ne correspond aux critères de recherche actuels.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
