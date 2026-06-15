'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Search, Plus, Eye, Download, Trash2 } from 'lucide-react';
import { InvoiceStatus } from '@/types';

export default function InvoicesPage() {
  const router = useRouter();
  const { invoices, deleteInvoice } = useApp();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  // Filter logic
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          invoice.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return { label: 'Payée', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80' };
      case 'sent':
        return { label: 'Envoyée', classes: 'bg-amber-50 text-amber-700 border-amber-200/80' };
      case 'overdue':
        return { label: 'En retard', classes: 'bg-rose-50 text-rose-700 border-rose-200/80' };
      case 'draft':
      default:
        return { label: 'Brouillon', classes: 'bg-slate-100 text-slate-700 border-slate-200/80' };
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, number: string) => {
    e.stopPropagation(); // Avoid triggering row navigation
    if (confirm(`Êtes-vous sûr de vouloir supprimer la facture ${number} ?`)) {
      try {
        await deleteInvoice(id);
        alert('Facture supprimée avec succès.');
      } catch (err) {
        console.error(err);
        alert('Une erreur est survenue lors de la suppression.');
      }
    }
  };

  const statusTabs: { value: InvoiceStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Toutes' },
    { value: 'draft', label: 'Brouillons' },
    { value: 'sent', label: 'Envoyées' },
    { value: 'paid', label: 'Payées' },
    { value: 'overdue', label: 'En retard' },
  ];

  return (
    <div className="space-y-8 animate-scale-in opacity-0 [animation-fill-mode:forwards]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms]">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Factures
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
            Gérez et suivez vos devis et facturations clients.
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-2xl shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] group self-start sm:self-auto"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Créer une facture</span>
        </Link>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Status Tabs */}
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

          {/* Search Bar */}
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par client ou N° facture..."
              className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
        <div className="overflow-x-auto">
          {filteredInvoices.length > 0 ? (
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 whitespace-nowrap">N° Facture</th>
                  <th className="px-6 py-4 whitespace-nowrap">Client</th>
                  <th className="px-6 py-4 whitespace-nowrap">Émission</th>
                  <th className="px-6 py-4 whitespace-nowrap">Échéance</th>
                  <th className="px-6 py-4 whitespace-nowrap">Statut</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Montant</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInvoices.map((invoice) => {
                  const { label, classes } = getStatusBadge(invoice.status);
                  return (
                    <tr 
                      key={invoice.id} 
                      onClick={() => router.push(`/invoices/${invoice.id}`)}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    >
                      {/* Invoice number */}
                      <td className="px-6 py-4.5 font-bold text-slate-900 whitespace-nowrap">
                        {invoice.invoiceNumber}
                      </td>
                      {/* Client */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{invoice.client.name}</span>
                          <span className="text-xs text-slate-400 font-medium">{invoice.client.email}</span>
                        </div>
                      </td>
                      {/* Date details */}
                      <td className="px-6 py-4.5 text-slate-500 font-medium whitespace-nowrap">
                        {invoice.issueDate}
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 font-medium whitespace-nowrap">
                        {invoice.dueDate}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${classes}`}>
                          {label}
                        </span>
                      </td>
                      {/* Billed totals */}
                      <td className="px-6 py-4.5 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-slate-900">
                            ${invoice.totalUsd.toLocaleString('en-US')} USD
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                            {Math.round(invoice.totalCdf).toLocaleString('fr-FR')} FC
                          </span>
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 opacity-85 group-hover:opacity-100 transition-opacity font-semibold">
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/invoices/${invoice.id}`); }}
                            title="Voir les détails"
                            className="p-2 text-slate-500 hover:text-primary hover:bg-primary-light rounded-xl transition-all duration-150"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/invoices/${invoice.id}?print=true`); }}
                            title="Télécharger/Imprimer PDF"
                            className="p-2 text-slate-500 hover:text-primary hover:bg-primary-light rounded-xl transition-all duration-150"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, invoice.id, invoice.invoiceNumber)}
                            title="Supprimer la facture"
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
              <h3 className="text-sm font-bold text-slate-700 mt-4">Aucune facture trouvée</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] text-center font-medium">
                Aucune facture ne correspond aux critères de recherche actuels.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
