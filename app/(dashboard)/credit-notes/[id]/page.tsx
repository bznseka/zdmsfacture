'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Trash2, Download, AlertCircle, FileText, Link2 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function CreditNoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { creditNotes, deleteCreditNote, settings } = useApp();

  const id = params?.id as string;
  const creditNote = creditNotes.find(c => c.id === id);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('print=true')) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!creditNote) {
    return (
      <div className="space-y-6 max-w-md mx-auto py-12 animate-scale-in">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mt-4">Avoir introuvable</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            L&apos;avoir demandé n&apos;existe pas ou a été supprimé.
          </p>
          <button
            onClick={() => router.push('/credit-notes')}
            className="mt-6 flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux avoirs</span>
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement l’avoir ${creditNote.creditNoteNumber} ?`)) {
      try {
        await deleteCreditNote(creditNote.id);
        alert('Avoir supprimé avec succès.');
        router.push('/credit-notes');
      } catch (err) {
        console.error(err);
        alert('Une erreur est survenue lors de la suppression.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-scale-in">
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/credit-notes')}
            className="flex items-center justify-center w-10 h-10 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-slate-800 shadow-sm transition-transform hover:scale-105 duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Détail avoir</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {creditNote.creditNoteNumber}
            </h1>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 hover:text-rose-800 transition-all duration-200 hover:scale-[1.01] self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Supprimer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
          <div className="print-sheet bg-white border border-slate-200/60 rounded-2xl shadow-xl p-8 md:p-12 space-y-8 relative overflow-hidden text-slate-800">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-rose-700" />

            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-xs font-bold text-rose-500 tracking-wider uppercase block">Avoir / Note de crédit</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {creditNote.creditNoteNumber}
                </span>
              </div>
              <div className="text-right">
                {settings.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.logoUrl} alt={settings.companyName} className="h-8 sm:h-10 object-contain ml-auto" />
                ) : (
                  <span className="text-lg font-black text-primary block">zdmsFacture</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Émetteur</span>
                <span className="block font-bold text-slate-900">{settings.companyName}</span>
                {settings.address && <span className="block text-slate-500 mt-1">{settings.address}</span>}
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Client</span>
                <span className="block font-bold text-slate-900">{creditNote.clientName}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Date d’émission</span>
                <span className="font-bold text-slate-700">{creditNote.issueDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Facture d’origine</span>
                <span className="font-bold text-slate-700">{creditNote.invoiceNumber}</span>
              </div>
            </div>

            <div className="space-y-2 pt-4 text-sm">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Motif</span>
              <p className="font-medium text-slate-700">{creditNote.reason}</p>
            </div>

            <div className="border-t border-slate-100 pt-6 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-900">Montant crédité</span>
                  <span className="text-base font-black text-rose-600">
                    -{formatCurrency(creditNote.amount, creditNote.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="no-print lg:col-span-4 space-y-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span>Facture liée</span>
            </h3>
            <button
              onClick={() => router.push(`/invoices/${creditNote.invoiceId}`)}
              className="w-full flex items-center justify-center gap-2 h-11 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-200"
            >
              Voir la facture {creditNote.invoiceNumber}
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Export & Impression</span>
            </h3>
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 h-11 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-200 hover:scale-[1.01]"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
