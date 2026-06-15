'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Search, Landmark, Coins, Smartphone, X, Save } from 'lucide-react';
import { Payment } from '@/types';

export default function PaymentsPage() {
  const { invoices, payments, addPayment, loading } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'cash' | 'mobile_money' | 'bank'>('all');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoiceId: '',
    method: 'mobile_money' as 'cash' | 'mobile_money' | 'bank',
    amount: '',
    reference: '',
    date: '',
  });

  const handleOpenAddModal = () => {
    // Only allow payments on sent/overdue/draft invoices
    const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');
    setFormData({
      invoiceId: unpaidInvoices[0]?.id || '',
      method: 'mobile_money',
      amount: unpaidInvoices[0] ? String(unpaidInvoices[0].totalUsd) : '0',
      reference: '',
      date: new Date().toLocaleDateString('fr-FR'),
    });
    setIsModalOpen(true);
  };

  const handleInvoiceChange = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    setFormData(prev => ({
      ...prev,
      invoiceId: id,
      amount: inv ? String(inv.totalUsd) : '0',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceId) {
      alert('Veuillez sélectionner une facture.');
      return;
    }
    if (Number(formData.amount) <= 0) {
      alert('Le montant du paiement doit être supérieur à 0.');
      return;
    }

    try {
      await addPayment({
        invoiceId: formData.invoiceId,
        amountUsd: Number(formData.amount),
        method: formData.method,
        reference: formData.reference || `REF-${Date.now().toString().slice(-5)}`,
        date: formData.date || new Date().toLocaleDateString('fr-FR'),
      });
      setIsModalOpen(false);
      alert('Paiement enregistré avec succès.');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l’enregistrement du paiement.');
    }
  };

  const getMethodBadge = (method: Payment['method']) => {
    switch (method) {
      case 'bank':
        return { label: 'Virement bancaire', icon: Landmark, classes: 'bg-indigo-50 text-indigo-700 border-indigo-100' };
      case 'mobile_money':
        return { label: 'Mobile Money', icon: Smartphone, classes: 'bg-teal-50 text-teal-700 border-teal-100' };
      case 'cash':
      default:
        return { label: 'Espèces (Cash)', icon: Coins, classes: 'bg-slate-50 text-slate-700 border-slate-100' };
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
    
    return matchesSearch && matchesMethod;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-scale-in opacity-0 [animation-fill-mode:forwards]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms]">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Paiements
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
            Enregistrez et gérez les règlements de vos clients.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-2xl shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] group self-start sm:self-auto"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Enregistrer un paiement</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
        <div className="flex overflow-x-auto gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto md:max-w-max no-scrollbar">
          <button
            onClick={() => setMethodFilter('all')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              methodFilter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setMethodFilter('bank')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              methodFilter === 'bank' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Banques
          </button>
          <button
            onClick={() => setMethodFilter('mobile_money')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              methodFilter === 'mobile_money' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Mobile Money
          </button>
          <button
            onClick={() => setMethodFilter('cash')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              methodFilter === 'cash' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Espèces
          </button>
        </div>

        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par client, référence ou N°..."
            className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
        <div className="overflow-x-auto">
          {filteredPayments.length > 0 ? (
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 whitespace-nowrap">Réf. Paiement</th>
                  <th className="px-6 py-4 whitespace-nowrap">N° Facture</th>
                  <th className="px-6 py-4 whitespace-nowrap">Client</th>
                  <th className="px-6 py-4 whitespace-nowrap">Date règlement</th>
                  <th className="px-6 py-4 whitespace-nowrap">Méthode</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Montant payé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPayments.map((payment) => {
                  const { label, icon: Icon, classes } = getMethodBadge(payment.method);
                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4.5 font-bold text-slate-900 whitespace-nowrap">
                        {payment.reference}
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 font-semibold whitespace-nowrap">
                        {payment.invoiceNumber}
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap font-bold text-slate-800">
                        {payment.clientName}
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 font-medium whitespace-nowrap">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${classes}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-slate-900">${payment.amountUsd.toLocaleString()} USD</span>
                          <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                            {Math.round(payment.amountCdf).toLocaleString('fr-FR')} FC
                          </span>
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
              <h3 className="text-sm font-bold text-slate-700 mt-4">Aucun règlement trouvé</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] text-center font-medium">
                Aucun paiement n&apos;est enregistré sous ces conditions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-2xl p-6 md:p-8 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Enregistrer un paiement client
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {/* Linked Invoice */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Sélectionner la Facture
                </label>
                <select
                  value={formData.invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                >
                  {invoices.filter(i => i.status !== 'paid').map(i => (
                    <option key={i.id} value={i.id}>
                      {i.invoiceNumber} - {i.client.name} (${i.totalUsd} USD)
                    </option>
                  ))}
                  {invoices.filter(i => i.status !== 'paid').length === 0 && (
                    <option value="">Aucune facture impayée</option>
                  )}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Méthode de règlement
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as Payment['method'] }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                >
                  <option value="mobile_money">Mobile Money (M-Pesa, Orange Money, Airtel Money)</option>
                  <option value="bank">Virement bancaire / Dépôt guichet</option>
                  <option value="cash">Espèces (Cash USD / CDF)</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Montant payé (USD)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 500"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              {/* Reference */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Numéro de référence / Code transaction
                </label>
                <input
                  type="text"
                  placeholder="Ex: MPESA-TX-99010"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-50 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 h-11 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/20 transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
