'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Search, X, Save } from 'lucide-react';
import { Refund } from '@/types';
import { formatCurrency } from '@/lib/currency';

export default function RefundsPage() {
  const { invoices, refunds, addRefund, loading } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    reason: '',
    status: 'pending' as Refund['status'],
  });

  const handleOpenAddModal = () => {
    // Only allow refunds on paid invoices
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    setFormData({
      invoiceId: paidInvoices[0]?.id || '',
      amount: paidInvoices[0] ? String(paidInvoices[0].totalUsd) : '0',
      reason: '',
      status: 'pending',
    });
    setIsModalOpen(true);
  };

  const selectedInvoice = invoices.find(i => i.id === formData.invoiceId);

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
      alert('Le montant doit être supérieur à 0.');
      return;
    }
    if (!formData.reason.trim()) {
      alert('Veuillez spécifier le motif du remboursement.');
      return;
    }

    try {
      await addRefund({
        invoiceId: formData.invoiceId,
        amountUsd: Number(formData.amount),
        status: formData.status,
        reason: formData.reason,
        date: new Date().toLocaleDateString('fr-FR'),
      });
      setIsModalOpen(false);
      alert('Demande de remboursement enregistrée avec succès.');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l’enregistrement de la demande.');
    }
  };

  const getStatusBadge = (status: Refund['status']) => {
    switch (status) {
      case 'approved':
        return { label: 'Approuvé', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80' };
      case 'rejected':
        return { label: 'Rejeté', classes: 'bg-rose-50 text-rose-700 border-rose-200/80' };
      case 'pending':
      default:
        return { label: 'En attente', classes: 'bg-amber-50 text-amber-700 border-amber-200/80' };
    }
  };

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch = refund.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          refund.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          refund.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
            Remboursements
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
            Gérez vos demandes de notes de crédit et remboursements clients.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-2xl shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] group self-start sm:self-auto"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Demander un remboursement</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
        <div className="flex overflow-x-auto gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto md:max-w-max no-scrollbar">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              statusFilter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              statusFilter === 'approved' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Approuvés
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              statusFilter === 'pending' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              statusFilter === 'rejected' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Rejetés
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
            placeholder="Rechercher par client, motif, N°..."
            className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
        <div className="overflow-x-auto">
          {filteredRefunds.length > 0 ? (
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 whitespace-nowrap">N° Facture</th>
                  <th className="px-6 py-4 whitespace-nowrap">Client</th>
                  <th className="px-6 py-4 whitespace-nowrap">Motif du remboursement</th>
                  <th className="px-6 py-4 whitespace-nowrap">Date émission</th>
                  <th className="px-6 py-4 whitespace-nowrap">Statut</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRefunds.map((refund) => {
                  const { label, classes } = getStatusBadge(refund.status);
                  return (
                    <tr key={refund.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4.5 font-bold text-slate-900 whitespace-nowrap">
                        {refund.invoiceNumber}
                      </td>
                      <td className="px-6 py-4.5 font-bold text-slate-800 whitespace-nowrap">
                        {refund.clientName}
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 font-medium whitespace-nowrap">
                        {refund.reason}
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 font-medium whitespace-nowrap">
                        {refund.date}
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${classes}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right whitespace-nowrap">
                        <span className="font-bold text-slate-900">{formatCurrency(refund.amountUsd, refund.currency)}</span>
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
              <h3 className="text-sm font-bold text-slate-700 mt-4">Aucune demande trouvée</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] text-center font-medium">
                Aucun remboursement n&apos;est enregistré sous ces conditions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Refund Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-2xl p-6 md:p-8 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Demander un remboursement
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
                  Facture Payée liée
                </label>
                <select
                  value={formData.invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                >
                  {invoices.filter(i => i.status === 'paid').map(i => (
                    <option key={i.id} value={i.id}>
                      {i.invoiceNumber} - {i.client.name} ({formatCurrency(i.totalUsd, i.currency)})
                    </option>
                  ))}
                  {invoices.filter(i => i.status === 'paid').length === 0 && (
                    <option value="">Aucune facture payée disponible</option>
                  )}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Montant à rembourser ({selectedInvoice?.currency || 'USD'})
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

              {/* Reason */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Motif du remboursement
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Expliquez la raison du remboursement..."
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full p-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
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
                  <span>Soumettre</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
