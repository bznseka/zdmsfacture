'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Edit, Trash2, Download, AlertCircle, RefreshCw, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { QuoteStatus } from '@/types';
import { formatCurrency } from '@/lib/currency';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { quotes, updateQuoteStatus, deleteQuote, convertQuoteToInvoice, settings } = useApp();
  const [converting, setConverting] = useState(false);

  const id = params?.id as string;
  const quote = quotes.find(q => q.id === id);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('print=true')) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!quote) {
    return (
      <div className="space-y-6 max-w-md mx-auto py-12 animate-scale-in">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mt-4">Devis introuvable</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Le devis demandé n&apos;existe pas ou a été supprimé.
          </p>
          <button
            onClick={() => router.push('/quotes')}
            className="mt-6 flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux devis</span>
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le devis ${quote.quoteNumber} ?`)) {
      try {
        await deleteQuote(quote.id);
        alert('Devis supprimé avec succès.');
        router.push('/quotes');
      } catch (err) {
        console.error(err);
        alert('Une erreur est survenue lors de la suppression.');
      }
    }
  };

  const handleStatusChange = async (newStatus: QuoteStatus) => {
    try {
      await updateQuoteStatus(quote.id, newStatus);
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue lors du changement de statut.');
    }
  };

  const handleConvert = async () => {
    setConverting(true);
    try {
      const invoice = await convertQuoteToInvoice(quote.id);
      alert('Devis converti en facture avec succès !');
      router.push(`/invoices/${invoice.id}`);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Une erreur est survenue lors de la conversion.');
    } finally {
      setConverting(false);
    }
  };

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

  const { label: statusLabel, classes: statusClasses } = getStatusBadge(quote.status);
  const canConvert = quote.status === 'accepted' && !quote.convertedInvoiceId;

  return (
    <div className="space-y-8 animate-scale-in">
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/quotes')}
            className="flex items-center justify-center w-10 h-10 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-slate-800 shadow-sm transition-transform hover:scale-105 duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Détail devis</span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {quote.quoteNumber}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${statusClasses}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {!quote.convertedInvoiceId && (
            <button
              onClick={() => router.push(`/quotes/${quote.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-950 shadow-sm transition-all duration-200 hover:scale-[1.01]"
            >
              <Edit className="w-4 h-4" />
              <span>Modifier</span>
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 hover:text-rose-800 transition-all duration-200 hover:scale-[1.01]"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
        </div>
      </div>

      {quote.convertedInvoiceId && (
        <div className="no-print bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Ce devis a été converti en facture.</span>
          <button
            onClick={() => router.push(`/invoices/${quote.convertedInvoiceId}`)}
            className="ml-auto text-xs font-bold underline hover:no-underline"
          >
            Voir la facture
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
          <div className="print-sheet bg-white border border-slate-200/60 rounded-2xl shadow-xl p-8 md:p-12 space-y-8 aspect-[1/1.4] relative overflow-hidden text-slate-800">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-purple-600" />

            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">Devis</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {quote.quoteNumber}
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
                {settings.phone && <span className="block text-slate-500">{settings.phone}</span>}
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Destinataire</span>
                <span className="block font-bold text-slate-900">{quote.client.name}</span>
                <span className="block text-slate-500 mt-1">{quote.client.address}</span>
                <span className="block text-slate-500">{quote.client.email}</span>
                <span className="block text-slate-500 mt-0.5">{quote.client.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Date d’émission</span>
                <span className="font-bold text-slate-700">{quote.issueDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Valide jusqu’au</span>
                <span className="font-bold text-slate-700">{quote.validUntil}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Détails des prestations</span>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="pb-2 text-left font-bold">Description</th>
                    <th className="pb-2 text-center font-bold w-12">Qté</th>
                    <th className="pb-2 text-right font-bold w-24">Prix Unit.</th>
                    <th className="pb-2 text-right font-bold w-24">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {quote.items && quote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-2 font-medium">{item.description}</td>
                      <td className="py-3 text-center font-semibold">{item.quantity}</td>
                      <td className="py-3 text-right font-semibold">{formatCurrency(item.unitPrice, quote.currency)}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(item.total, quote.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 pt-6 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Sous-total</span>
                  <span className="font-bold text-slate-700">{formatCurrency(quote.subtotal, quote.currency)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>TVA ({quote.taxRate}%)</span>
                  <span className="font-bold text-slate-700">{formatCurrency(quote.taxAmount, quote.currency)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-2.5">
                  <span className="font-bold text-slate-900">Total Net</span>
                  <span className="text-base font-black text-primary">{formatCurrency(quote.total, quote.currency)}</span>
                </div>
              </div>
            </div>

            {quote.notes && (
              <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed">
                <span className="block font-bold uppercase tracking-wider text-slate-500 mb-1">Notes complémentaires :</span>
                <p className="font-medium whitespace-pre-line">{quote.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="no-print lg:col-span-4 space-y-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
          {canConvert && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Conversion</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Ce devis a été accepté. Convertissez-le en facture pour démarrer la facturation.
              </p>
              <button
                onClick={handleConvert}
                disabled={converting}
                className="w-full flex items-center justify-center gap-2 h-11 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
              >
                {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Convertir en facture</span>
              </button>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              <span>Changer le statut</span>
            </h3>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Statut actuel du devis
              </label>
              <select
                value={quote.status}
                onChange={(e) => handleStatusChange(e.target.value as QuoteStatus)}
                disabled={!!quote.convertedInvoiceId}
                className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 disabled:opacity-60"
              >
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="rejected">Refusé</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Export & Impression</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Générez un document imprimable ou téléchargez ce devis au format PDF.
            </p>
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
