'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/currency';
import { ArrowLeft, Save } from 'lucide-react';

interface CreditNoteFormProps {
  initialInvoiceId?: string;
}

export default function CreditNoteForm({ initialInvoiceId }: CreditNoteFormProps) {
  const router = useRouter();
  const { invoices, addCreditNote } = useApp();

  const creditableInvoices = invoices.filter(i => i.status !== 'draft');

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    initialInvoiceId || creditableInvoices[0]?.id || ''
  );
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  const selectedInvoice = creditableInvoices.find(i => i.id === selectedInvoiceId);

  useEffect(() => {
    if (selectedInvoice) {
      setAmount(String(selectedInvoice.totalUsd));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInvoiceId]);

  const convertYmdToFrenchDate = (dateStr: string): string => {
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  const handleSave = async () => {
    if (!selectedInvoice) {
      alert('Veuillez sélectionner une facture.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Le montant doit être supérieur à 0.');
      return;
    }
    if (Number(amount) > selectedInvoice.totalUsd) {
      alert('Le montant de l’avoir ne peut pas dépasser le total de la facture.');
      return;
    }
    if (!reason.trim()) {
      alert('Veuillez indiquer le motif de l’avoir.');
      return;
    }

    try {
      const created = await addCreditNote({
        invoiceId: selectedInvoice.id,
        status: 'issued',
        issueDate: convertYmdToFrenchDate(issueDate),
        amount: Number(amount),
        reason,
      });
      router.push(`/credit-notes/${created.id}`);
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue lors de l’enregistrement de l’avoir.');
    }
  };

  if (creditableInvoices.length === 0) {
    return (
      <div className="space-y-6 max-w-md mx-auto py-12 animate-scale-in">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <h3 className="text-base font-bold text-slate-800 mt-4">Aucune facture disponible</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Un avoir doit être lié à une facture existante (non brouillon). Créez d&apos;abord une facture.
          </p>
          <button
            onClick={() => router.push('/invoices')}
            className="mt-6 flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voir les factures</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms]">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-slate-800 shadow-sm transition-transform hover:scale-105 duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Avoir</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Nouvel avoir
          </h1>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Facture à créditer
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            >
              {creditableInvoices.map(i => (
                <option key={i.id} value={i.id}>
                  {i.invoiceNumber} - {i.client.name} ({formatCurrency(i.totalUsd, i.currency)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Montant de l’avoir {selectedInvoice ? `(${selectedInvoice.currency})` : ''}
            </label>
            <input
              type="number"
              min="0"
              max={selectedInvoice?.totalUsd}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
            <p className="text-[11px] text-slate-400 font-medium mt-1.5">
              Peut être partiel — ne peut pas dépasser le total de la facture.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Date d’émission
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Motif de l’avoir
            </label>
            <textarea
              rows={3}
              required
              placeholder="Ex: Remise commerciale, erreur de facturation, retour produit..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 h-12 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.01]"
        >
          <Save className="w-4 h-4" />
          <span>Émettre l’avoir</span>
        </button>
      </div>
    </div>
  );
}
