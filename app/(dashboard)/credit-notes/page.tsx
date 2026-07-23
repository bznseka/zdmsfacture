'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Search, Plus, Eye, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function CreditNotesPage() {
  const router = useRouter();
  const { creditNotes, deleteCreditNote } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCreditNotes = creditNotes.filter((c) =>
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.creditNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: string, number: string) => {
    e.stopPropagation();
    if (confirm(`Êtes-vous sûr de vouloir supprimer l’avoir ${number} ?`)) {
      try {
        await deleteCreditNote(id);
        alert('Avoir supprimé avec succès.');
      } catch (err) {
        console.error(err);
        alert('Une erreur est survenue lors de la suppression.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-scale-in opacity-0 [animation-fill-mode:forwards]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms]">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Avoirs
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
            Notes de crédit émises pour vos factures.
          </p>
        </div>

        <Link
          href="/credit-notes/new"
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-2xl shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] group self-start sm:self-auto"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Créer un avoir</span>
        </Link>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par client, N° avoir ou N° facture..."
            className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
        <div className="overflow-x-auto">
          {filteredCreditNotes.length > 0 ? (
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 whitespace-nowrap">N° Avoir</th>
                  <th className="px-6 py-4 whitespace-nowrap">Facture d&apos;origine</th>
                  <th className="px-6 py-4 whitespace-nowrap">Client</th>
                  <th className="px-6 py-4 whitespace-nowrap">Émission</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Montant crédité</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCreditNotes.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/credit-notes/${c.id}`)}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4.5 font-bold text-slate-900 whitespace-nowrap">
                      {c.creditNoteNumber}
                    </td>
                    <td className="px-6 py-4.5 text-slate-500 font-semibold whitespace-nowrap">
                      {c.invoiceNumber}
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap font-semibold text-slate-800">
                      {c.clientName}
                    </td>
                    <td className="px-6 py-4.5 text-slate-500 font-medium whitespace-nowrap">
                      {c.issueDate}
                    </td>
                    <td className="px-6 py-4.5 text-right whitespace-nowrap">
                      <span className="font-bold text-rose-600">
                        -{formatCurrency(c.amount, c.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 opacity-85 group-hover:opacity-100 transition-opacity font-semibold">
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/credit-notes/${c.id}`); }}
                          title="Voir les détails"
                          className="p-2 text-slate-500 hover:text-primary hover:bg-primary-light rounded-xl transition-all duration-150"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, c.id, c.creditNoteNumber)}
                          title="Supprimer"
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-150"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mt-4">Aucun avoir trouvé</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] text-center font-medium">
                Aucun avoir ne correspond aux critères de recherche actuels.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
