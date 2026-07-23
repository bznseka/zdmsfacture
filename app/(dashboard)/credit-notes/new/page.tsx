'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CreditNoteForm from '@/components/creditNotes/CreditNoteForm';

function NewCreditNoteContent() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId') || undefined;

  return (
    <div className="animate-scale-in">
      <CreditNoteForm initialInvoiceId={invoiceId} />
    </div>
  );
}

export default function NewCreditNotePage() {
  return (
    <Suspense>
      <NewCreditNoteContent />
    </Suspense>
  );
}
