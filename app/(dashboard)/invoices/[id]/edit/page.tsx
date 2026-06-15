'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { invoices } = useApp();
  
  const id = params?.id as string;
  const invoice = invoices.find(inv => inv.id === id);

  if (!invoice) {
    return (
      <div className="space-y-6 max-w-md mx-auto py-12 animate-scale-in">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mt-4">Facture introuvable</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            La facture que vous essayez de modifier n&apos;existe pas ou a été supprimée.
          </p>
          <button
            onClick={() => router.push('/invoices')}
            className="mt-6 flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux factures</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-scale-in">
      <InvoiceForm initialInvoice={invoice} isEditing={true} />
    </div>
  );
}
