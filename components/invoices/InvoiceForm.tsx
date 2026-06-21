'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Invoice, LineItem, InvoiceStatus } from '@/types';
import { Plus, Trash2, ArrowLeft, Save, Send, Eye, Check, Download, X } from 'lucide-react';

interface InvoiceFormProps {
  initialInvoice?: Invoice;
  isEditing?: boolean;
}

export default function InvoiceForm({ initialInvoice, isEditing = false }: InvoiceFormProps) {
  const router = useRouter();
  const { clients, invoices, addInvoice, updateInvoice, exchangeRate, getNextInvoiceNumber, settings } = useApp();

  // Form Fields State
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialInvoice?.client.id || (clients[0]?.id || '')
  );
  
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getDueDateString = () => {
    const today = new Date();
    today.setDate(today.getDate() + 30); // 30 days from now by default
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [issueDate, setIssueDate] = useState<string>(
    initialInvoice 
      ? convertFrenchDateToYmd(initialInvoice.issueDate)
      : getTodayDateString()
  );
  
  const [dueDate, setDueDate] = useState<string>(
    initialInvoice 
      ? convertFrenchDateToYmd(initialInvoice.dueDate)
      : getDueDateString()
  );

  const [items, setItems] = useState<Omit<LineItem, 'total'>[]>([
    ...(initialInvoice?.items || [{ id: 'item_1', description: '', quantity: 1, unitPrice: 0 }])
  ]);

  const [notes, setNotes] = useState<string>(initialInvoice?.notes || '');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Date helper convert DD/MM/YYYY to YYYY-MM-DD
  function convertFrenchDateToYmd(dateStr: string): string {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }

  // Date helper convert YYYY-MM-DD to DD/MM/YYYY
  function convertYmdToFrenchDate(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  // Generate temporary or actual invoice number for preview
  useEffect(() => {
    if (isEditing && initialInvoice) {
      setInvoiceNumber(initialInvoice.invoiceNumber);
    } else {
      setInvoiceNumber(getNextInvoiceNumber());
    }
  }, [invoices, isEditing, initialInvoice, getNextInvoiceNumber]);

  // Selected Client details
  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  // Dynamic Item Row manipulation
  const handleAddItemRow = () => {
    setItems(prev => [
      ...prev,
      { id: `item_${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }
    ]);
  };

  const handleRemoveItemRow = (id: string) => {
    if (items.length === 1) {
      alert('Une facture doit comporter au moins une ligne d’article.');
      return;
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleItemFieldChange = (id: string, field: 'description' | 'quantity' | 'unitPrice', value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        if (field === 'description') {
          return { ...item, description: String(value) };
        } else {
          return { ...item, [field]: Number(value) };
        }
      }
      return item;
    }));
  };

  // Financial calculations (Rounded to integers as requested)
  const lineTotals = items.map(item => Math.round(item.quantity * item.unitPrice));
  const subtotal = Math.round(lineTotals.reduce((sum, current) => sum + current, 0));
  const taxRate = 18; // 18% Standard DRC
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const totalUsd = subtotal + taxAmount;
  const totalCdf = totalUsd * exchangeRate;

  // Submit form handler
  const handleSaveInvoice = async (status: InvoiceStatus) => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client.');
      return;
    }

    if (items.some(item => !item.description.trim() || item.unitPrice < 0 || item.quantity <= 0)) {
      alert('Veuillez remplir correctement toutes les lignes d’articles.');
      return;
    }

    // Format fields with computed line totals
    const formattedItems: LineItem[] = items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Math.round(item.unitPrice),
      total: Math.round(item.quantity * item.unitPrice)
    }));

    const invoiceData = {
      client: selectedClient,
      status,
      issueDate: convertYmdToFrenchDate(issueDate),
      dueDate: convertYmdToFrenchDate(dueDate),
      items: formattedItems,
      taxRate,
      notes,
    };

    try {
      if (isEditing && initialInvoice) {
        await updateInvoice(initialInvoice.id, {
          ...invoiceData,
        });
        alert('Facture mise à jour avec succès !');
        router.push(`/invoices/${initialInvoice.id}`);
      } else {
        const newInvoice = await addInvoice(invoiceData);
        setCreatedInvoiceId(newInvoice.id);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue lors de l’enregistrement de la facture.');
    }
  };


  return (
    <div className="space-y-8">
      {/* Header with Return Action */}
      <div className="flex items-center gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms]">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-slate-800 shadow-sm transition-transform hover:scale-105 duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Facturation</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {isEditing ? `Modifier la facture ${invoiceNumber}` : 'Nouvelle facture'}
          </h1>
        </div>
      </div>

      {/* Split Pane Grid Builder + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FORM BUILDER */}
        <div className="lg:col-span-6 space-y-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
          
          {/* General Fields Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3">Détails généraux</h3>
            
            <div className="space-y-4">
              {/* Client Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Sélectionner le Client
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

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    Date d’échéance
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="text-base font-bold text-slate-900">Lignes de la facture</h3>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary-light hover:bg-primary/10 rounded-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une ligne</span>
              </button>
            </div>

            {/* Dynamic Items Table */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-slate-50 rounded-xl relative group">
                  {/* Item Description */}
                  <div className="flex-1">
                    <label className="block sm:hidden text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="Description de l'article ou service"
                      value={item.description}
                      onChange={(e) => handleItemFieldChange(item.id, 'description', e.target.value)}
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-200/80 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="w-full sm:w-20">
                    <label className="block sm:hidden text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Qté
                    </label>
                    <input
                      type="number"
                      placeholder="Qté"
                      min="1"
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={(e) => handleItemFieldChange(item.id, 'quantity', e.target.value)}
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-200/80 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="w-full sm:w-32">
                    <label className="block sm:hidden text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      P.U. ($)
                    </label>
                    <input
                      type="number"
                      placeholder="P.U. ($)"
                      min="0"
                      value={item.unitPrice === 0 ? '' : item.unitPrice}
                      onChange={(e) => handleItemFieldChange(item.id, 'unitPrice', e.target.value)}
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-200/80 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                    />
                  </div>

                  {/* Line total (display calculated result) */}
                  <div className="w-full sm:w-24 text-right pr-2 hidden sm:block">
                    <span className="block text-xs text-slate-400 font-medium">Total Ligne</span>
                    <span className="block text-sm font-bold text-slate-700 mt-1">
                      ${Math.round(item.quantity * item.unitPrice).toLocaleString()} USD
                    </span>
                  </div>

                  {/* Trash/Delete Action */}
                  <div className="flex justify-end pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer la ligne"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3">Notes & Conditions</h3>
            <textarea
              rows={3}
              placeholder="Conditions de paiement, informations de versement bancaire ou de paiement mobile money (M-Pesa, Orange Money, Airtel Money)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
            />
          </div>

          {/* Submission Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleSaveInvoice('draft')}
              className="flex-1 flex items-center justify-center gap-2 h-12 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-950 transition-all duration-200 hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" />
              <span>Brouillon</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveInvoice('sent')}
              className="flex-1 flex items-center justify-center gap-2 h-12 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.01]"
            >
              <Send className="w-4 h-4" />
              <span>Enregistrer la facture</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE REAL-TIME PREVIEW */}
        <div className="lg:col-span-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms] lg:sticky lg:top-24">
          <div className="flex items-center gap-2 mb-3 px-2 text-slate-500">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Aperçu en temps réel</span>
          </div>

          {/* Simulated A4 invoice container */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xl p-8 md:p-10 space-y-8 aspect-[1/1.4] relative overflow-hidden text-slate-800">
            {/* Top border colored stripe for premium look */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-purple-600" />
            
            {/* Preview Header */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">Facture</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">
                  {invoiceNumber || 'INV-2026-XXXX'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-primary block">zdmsFacture</span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider block mt-1">Kinshasa, RDC</span>
              </div>
            </div>

            {/* Billing Information details */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Émetteur</span>
                <span className="block font-bold text-slate-900">{settings.companyName}</span>
                {settings.address && <span className="block text-slate-500 mt-1">{settings.address}</span>}
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Facturé à</span>
                {selectedClient ? (
                  <>
                    <span className="block font-bold text-slate-900">{selectedClient.name}</span>
                    <span className="block text-slate-500 mt-1">{selectedClient.address}</span>
                    <span className="block text-slate-500">{selectedClient.email}</span>
                  </>
                ) : (
                  <span className="text-slate-400 italic font-semibold">Aucun client sélectionné</span>
                )}
              </div>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Date d’émission</span>
                <span className="font-bold text-slate-700">
                  {issueDate ? convertYmdToFrenchDate(issueDate) : '-'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Date d’échéance</span>
                <span className="font-bold text-slate-700">
                  {dueDate ? convertYmdToFrenchDate(dueDate) : '-'}
                </span>
              </div>
            </div>

            {/* Invoice Line Items preview list */}
            <div className="space-y-4 pt-4">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Détails des articles</span>
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
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 pr-2 font-medium truncate max-w-[200px]">
                        {item.description || <span className="text-slate-300 italic font-semibold">Description article...</span>}
                      </td>
                      <td className="py-2.5 text-center font-semibold">{item.quantity}</td>
                      <td className="py-2.5 text-right font-semibold">${Math.round(item.unitPrice).toLocaleString()}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">${Math.round(item.quantity * item.unitPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pricing Summary Calculation */}
            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Sous-total</span>
                  <span className="font-bold text-slate-700">${subtotal.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>TVA (18%)</span>
                  <span className="font-bold text-slate-700">${taxAmount.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-2.5">
                  <span className="font-bold text-slate-900">Total Net (USD)</span>
                  <span className="text-base font-black text-primary">${totalUsd.toLocaleString()} USD</span>
                </div>
                {/* CDF indicative conversion */}
                <div className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100 font-bold text-slate-500">
                  <span>Montant indicatif (CDF)</span>
                  <span className="text-slate-800">{Math.round(totalCdf).toLocaleString('fr-FR')} FC</span>
                </div>
              </div>
            </div>

            {/* Notes Section preview */}
            {notes && (
              <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed">
                <span className="block font-bold uppercase tracking-wider text-slate-500 mb-1">Notes importantes :</span>
                <p className="font-medium whitespace-pre-line">{notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in font-sans">
          <div className="relative bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl p-6 md:p-8 animate-scale-in text-center flex flex-col items-center">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/invoices');
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Checkmark icon wrapper */}
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 mb-4 mt-2">
              <Check className="w-6 h-6" />
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Facture créée avec succès
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1.5 mb-6">
              Que souhaitez-vous faire maintenant ?
            </p>

            {/* Action Buttons */}
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/invoices');
                }}
                className="flex-1 h-11 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
              >
                Retourner aux factures
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push(`/invoices/${createdInvoiceId}?print=true`);
                }}
                className="flex-1 flex items-center justify-center gap-2 h-11 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
