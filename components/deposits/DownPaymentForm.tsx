'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { DownPayment, DownPaymentStatus } from '@/types';
import { CURRENCIES, Currency } from '@/lib/currency';
import { ArrowLeft, Save, Send } from 'lucide-react';

interface DownPaymentFormProps {
  initialDownPayment?: DownPayment;
  isEditing?: boolean;
}

export default function DownPaymentForm({ initialDownPayment, isEditing = false }: DownPaymentFormProps) {
  const router = useRouter();
  const { clients, invoices, addDownPayment, updateDownPayment, settings } = useApp();

  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialDownPayment?.client.id || (clients[0]?.id || '')
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    initialDownPayment?.invoiceId || ''
  );
  const [description, setDescription] = useState<string>(initialDownPayment?.description || '');
  const [amount, setAmount] = useState<string>(
    initialDownPayment ? String(initialDownPayment.amount) : ''
  );
  const [currency, setCurrency] = useState<Currency>(initialDownPayment?.currency || settings.currency || 'USD');
  const [notes, setNotes] = useState<string>(initialDownPayment?.notes || '');
  const [issueDate, setIssueDate] = useState<string>(() => {
    if (initialDownPayment) {
      const parts = initialDownPayment.issueDate.split('/');
      return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : '';
    }
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const convertYmdToFrenchDate = (dateStr: string): string => {
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  const handleSave = async (status: DownPaymentStatus) => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client.');
      return;
    }
    if (!description.trim()) {
      alert('Veuillez indiquer une description pour cet acompte.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Le montant doit être supérieur à 0.');
      return;
    }

    const downPaymentData = {
      client: selectedClient,
      invoiceId: selectedInvoiceId || null,
      status,
      issueDate: convertYmdToFrenchDate(issueDate),
      description,
      amount: Number(amount),
      currency,
      notes,
    };

    try {
      if (isEditing && initialDownPayment) {
        await updateDownPayment(initialDownPayment.id, downPaymentData);
        alert('Acompte mis à jour avec succès !');
        router.push(`/down-payments/${initialDownPayment.id}`);
      } else {
        const created = await addDownPayment(downPaymentData);
        router.push(`/down-payments/${created.id}`);
      }
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue lors de l’enregistrement de l’acompte.');
    }
  };

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
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Acompte</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {isEditing ? 'Modifier l’acompte' : 'Nouvel acompte'}
          </h1>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Client
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Facture liée (optionnel)
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            >
              <option value="">Aucune</option>
              {invoices.map(i => (
                <option key={i.id} value={i.id}>{i.invoiceNumber} - {i.client.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Montant
              </label>
              <input
                type="number"
                min="0"
                placeholder="Ex: 300"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Devise
              </label>
              <select
                value={currency}
                disabled={isEditing}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {CURRENCIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
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
              Description
            </label>
            <input
              type="text"
              placeholder="Ex: Acompte de 30% sur la prestation X"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Notes (optionnel)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
        <button
          type="button"
          onClick={() => handleSave('draft')}
          className="flex-1 flex items-center justify-center gap-2 h-12 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-950 transition-all duration-200 hover:scale-[1.01]"
        >
          <Save className="w-4 h-4" />
          <span>Brouillon</span>
        </button>
        <button
          type="button"
          onClick={() => handleSave('sent')}
          className="flex-1 flex items-center justify-center gap-2 h-12 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.01]"
        >
          <Send className="w-4 h-4" />
          <span>Enregistrer l’acompte</span>
        </button>
      </div>
    </div>
  );
}
