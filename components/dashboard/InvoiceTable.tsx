import React from 'react';
import { useRouter } from 'next/navigation';
import { Invoice } from '@/types';
import { Eye, Download } from 'lucide-react';

interface InvoiceTableProps {
  invoices: Invoice[];
}

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  const router = useRouter();
  // Helper to get status badge classes and label
  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Payée',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        };
      case 'sent':
        return {
          label: 'Envoyée',
          classes: 'bg-amber-50 text-amber-700 border-amber-200/80',
        };
      case 'overdue':
        return {
          label: 'En retard',
          classes: 'bg-rose-50 text-rose-700 border-rose-200/80',
        };
      case 'draft':
      default:
        return {
          label: 'Brouillon',
          classes: 'bg-slate-100 text-slate-700 border-slate-200/80',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Table Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-50">
        <div>
          <h3 className="text-base font-bold text-slate-900">Dernières factures</h3>
          <p className="text-xs text-slate-400 font-medium">Historique des transactions récentes</p>
        </div>
        <button className="text-xs font-bold text-primary hover:text-primary-hover bg-primary-light px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto">
          Voir toutes les factures
        </button>
      </div>

      {/* Table Body / Wrapper */}
      <div className="flex-1 overflow-x-auto">
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
            {invoices.map((invoice) => {
              const { label, classes } = getStatusBadge(invoice.status);
              return (
                <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                  {/* Invoice ID */}
                  <td className="px-6 py-4.5 font-bold text-slate-900 whitespace-nowrap">
                    {invoice.invoiceNumber}
                  </td>
                  {/* Client name & email */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{invoice.client.name}</span>
                      <span className="text-xs text-slate-400 font-medium">{invoice.client.email}</span>
                    </div>
                  </td>
                  {/* Dates */}
                  <td className="px-6 py-4.5 text-slate-500 font-medium whitespace-nowrap">{invoice.issueDate}</td>
                  <td className="px-6 py-4.5 text-slate-500 font-medium whitespace-nowrap">{invoice.dueDate}</td>
                  {/* Status */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${classes}`}>
                      {label}
                    </span>
                  </td>
                  {/* Amount */}
                  <td className="px-6 py-4.5 text-right whitespace-nowrap">
                    <span className="font-bold text-slate-900">
                      ${invoice.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                        title="Détails"
                        className="p-2 text-slate-500 hover:text-primary hover:bg-primary-light rounded-xl transition-all duration-150"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => router.push(`/invoices/${invoice.id}?print=true`)}
                        title="Télécharger PDF"
                        className="p-2 text-slate-500 hover:text-primary hover:bg-primary-light rounded-xl transition-all duration-150"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
