'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Client,
  Invoice,
  InvoiceStatus,
  CompanySettings,
  Payment,
  Refund,
  Quote,
  QuoteStatus,
  DownPayment,
  DownPaymentStatus,
  CreditNote,
} from '@/types';
import { apiFetch } from '@/lib/api-client';

type SessionUser = { id: string; email?: string | null; role?: string };

interface AppContextType {
  clients: Client[];
  invoices: Invoice[];
  settings: CompanySettings;
  payments: Payment[];
  refunds: Refund[];
  quotes: Quote[];
  downPayments: DownPayment[];
  creditNotes: CreditNote[];
  loading: boolean;
  user: SessionUser | null;
  authLoading: boolean;
  addClient: (client: Omit<Client, 'id'>) => Promise<Client>;
  updateClient: (id: string, updatedClient: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'totalUsd' | 'taxAmount' | 'subtotal'>) => Promise<Invoice>;
  updateInvoice: (id: string, updatedInvoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  getNextInvoiceNumber: () => string;
  updateSettings: (newSettings: Partial<CompanySettings>) => Promise<void>;
  setLogoUrl: (logoUrl: string) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'invoiceNumber' | 'clientName' | 'currency'>) => Promise<Payment>;
  addRefund: (refund: Omit<Refund, 'id' | 'invoiceNumber' | 'clientName' | 'currency'>) => Promise<Refund>;
  addQuote: (quote: Omit<Quote, 'id' | 'quoteNumber' | 'total' | 'taxAmount' | 'subtotal' | 'convertedInvoiceId'>) => Promise<Quote>;
  updateQuote: (id: string, updatedQuote: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  updateQuoteStatus: (id: string, status: QuoteStatus) => Promise<void>;
  convertQuoteToInvoice: (id: string) => Promise<Invoice>;
  getNextQuoteNumber: () => string;
  addDownPayment: (downPayment: Omit<DownPayment, 'id' | 'downPaymentNumber' | 'invoiceNumber'>) => Promise<DownPayment>;
  updateDownPayment: (id: string, updatedDownPayment: Partial<DownPayment>) => Promise<void>;
  deleteDownPayment: (id: string) => Promise<void>;
  updateDownPaymentStatus: (id: string, status: DownPaymentStatus) => Promise<void>;
  getNextDownPaymentNumber: () => string;
  addCreditNote: (creditNote: Omit<CreditNote, 'id' | 'creditNoteNumber' | 'invoiceNumber' | 'clientName' | 'currency'>) => Promise<CreditNote>;
  deleteCreditNote: (id: string) => Promise<void>;
  getNextCreditNoteNumber: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: 'Ma Société',
  email: '',
  phone: '',
  address: '',
  taxNumber: '',
  taxRate: 18,
  mobileMoneyDetails: '',
  logoUrl: '',
  currency: 'USD',
};

// Helper date conversions
function convertDbDateToFrench(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function convertFrenchDateToDb(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const user: SessionUser | null = session?.user?.id
    ? { id: session.user.id, email: session.user.email, role: session.user.role }
    : null;
  const authLoading = status === 'loading';

  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [downPayments, setDownPayments] = useState<DownPayment[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [settingsData, clientsData, invoicesData, paymentsData, refundsData, quotesData, downPaymentsData, creditNotesData] = await Promise.all([
        apiFetch<CompanySettings>('/api/settings'),
        apiFetch<Client[]>('/api/clients'),
        apiFetch<any[]>('/api/invoices'),
        apiFetch<any[]>('/api/payments'),
        apiFetch<any[]>('/api/refunds'),
        apiFetch<any[]>('/api/quotes'),
        apiFetch<any[]>('/api/down-payments'),
        apiFetch<any[]>('/api/credit-notes'),
      ]);

      setSettings(settingsData);
      setClients(clientsData);
      setInvoices(
        invoicesData.map((inv) => ({
          ...inv,
          issueDate: convertDbDateToFrench(inv.issueDate),
          dueDate: convertDbDateToFrench(inv.dueDate),
        }))
      );
      setPayments(paymentsData.map((p) => ({ ...p, date: convertDbDateToFrench(p.date) })));
      setRefunds(refundsData.map((r) => ({ ...r, date: convertDbDateToFrench(r.date) })));
      setQuotes(
        quotesData.map((q) => ({
          ...q,
          issueDate: convertDbDateToFrench(q.issueDate),
          validUntil: convertDbDateToFrench(q.validUntil),
        }))
      );
      setDownPayments(downPaymentsData.map((d) => ({ ...d, issueDate: convertDbDateToFrench(d.issueDate) })));
      setCreditNotes(creditNotesData.map((c) => ({ ...c, issueDate: convertDbDateToFrench(c.issueDate) })));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    } else if (status === 'unauthenticated') {
      setClients([]);
      setInvoices([]);
      setPayments([]);
      setRefunds([]);
      setQuotes([]);
      setDownPayments([]);
      setCreditNotes([]);
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Helper to get initials of company name
  function getCompanyInitials(name: string): string {
    if (!name) return 'ZDM';
    const words = name.trim().split(/\s+/);
    if (words[0] && words[0] === words[0].toUpperCase() && words[0].length >= 2) {
      return words[0].replace(/[^A-Z]/g, '');
    }
    const initials = words
      .map(w => w.charAt(0).toUpperCase())
      .join('')
      .replace(/[^A-Z]/g, '');
    return initials.slice(0, 4) || name.slice(0, 3).toUpperCase();
  }

  // Generate next sequential document number in format PREFIX-YYYY-NNNN-INITIALS
  const getNextDocumentNumber = (docPrefix: string, existingNumbers: string[]) => {
    const currentYear = new Date().getFullYear();
    const prefix = `${docPrefix}-${currentYear}-`;

    const yearDocs = existingNumbers.filter(n => n.startsWith(prefix));
    const initials = getCompanyInitials(settings.companyName);

    if (yearDocs.length === 0) {
      return `${prefix}0001-${initials}`;
    }

    const numbers = yearDocs.map(n => {
      const parts = n.split('-');
      if (parts.length >= 3) {
        const num = parseInt(parts[2], 10);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    });

    const maxNum = Math.max(...numbers, 0);
    const nextNum = maxNum + 1;
    return `${prefix}${nextNum.toString().padStart(4, '0')}-${initials}`;
  };

  // Generate next sequential invoice number in format INV-YYYY-NNNN-INITIALS
  const getNextInvoiceNumber = () => {
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;

    const yearInvoices = invoices.filter(inv => inv.invoiceNumber.startsWith(prefix));
    const initials = getCompanyInitials(settings.companyName);

    if (yearInvoices.length === 0) {
      return `${prefix}0043-${initials}`; // Offset matching mock highest number
    }

    const numbers = yearInvoices.map(inv => {
      const parts = inv.invoiceNumber.split('-');
      if (parts.length >= 3) {
        const num = parseInt(parts[2], 10);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    });

    const maxNum = Math.max(...numbers, 42);
    const nextNum = maxNum + 1;
    return `${prefix}${nextNum.toString().padStart(4, '0')}-${initials}`;
  };

  const getNextQuoteNumber = () => getNextDocumentNumber('DEV', quotes.map(q => q.quoteNumber));
  const getNextDownPaymentNumber = () => getNextDocumentNumber('ACO', downPayments.map(d => d.downPaymentNumber));
  const getNextCreditNoteNumber = () => getNextDocumentNumber('AV', creditNotes.map(c => c.creditNoteNumber));

  // CLIENTS CRUD
  const addClient = async (newClientData: Omit<Client, 'id'>) => {
    const newClient = await apiFetch<Client>('/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        address: newClientData.address,
        country: newClientData.country || '',
        category: newClientData.category || 'individual',
      }),
    });

    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = async (id: string, updatedClient: Partial<Client>) => {
    await apiFetch(`/api/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: updatedClient.name,
        email: updatedClient.email,
        phone: updatedClient.phone,
        address: updatedClient.address,
        country: updatedClient.country,
        category: updatedClient.category,
      }),
    });

    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedClient } : c));

    // Cascade update client info in invoices list locally
    setInvoices(prev => prev.map(inv => {
      if (inv.client.id === id) {
        return {
          ...inv,
          client: { ...inv.client, ...updatedClient }
        };
      }
      return inv;
    }));
  };

  const deleteClient = async (id: string) => {
    await apiFetch(`/api/clients/${id}`, { method: 'DELETE' });
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // INVOICES CRUD
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'totalUsd' | 'taxAmount' | 'subtotal'>) => {
    let calculatedSubtotal = 0;
    if (invoiceData.items) {
      calculatedSubtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    const subtotal = Math.round(calculatedSubtotal);
    const taxAmount = Math.round(subtotal * (invoiceData.taxRate / 100));
    const totalUsd = subtotal + taxAmount;
    const invoiceNumber = getNextInvoiceNumber();

    const created = await apiFetch<{ id: string; items: Invoice['items'] }>('/api/invoices', {
      method: 'POST',
      body: JSON.stringify({
        invoiceNumber,
        clientId: invoiceData.client.id,
        status: invoiceData.status,
        issueDate: convertFrenchDateToDb(invoiceData.issueDate),
        dueDate: convertFrenchDateToDb(invoiceData.dueDate),
        subtotal,
        taxRate: invoiceData.taxRate,
        taxAmount,
        totalUsd,
        currency: invoiceData.currency,
        notes: invoiceData.notes || '',
        items: invoiceData.items || [],
      }),
    });

    const newInvoice: Invoice = {
      ...invoiceData,
      id: created.id,
      invoiceNumber,
      subtotal,
      taxAmount,
      totalUsd,
      items: created.items,
    };

    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = async (id: string, updatedData: Partial<Invoice>) => {
    let subtotal = updatedData.subtotal;
    let taxAmount = updatedData.taxAmount;
    let totalUsd = updatedData.totalUsd;

    const existingInvoice = invoices.find(inv => inv.id === id);
    if (!existingInvoice) return;

    const mergedItems = updatedData.items || existingInvoice.items || [];
    const mergedTaxRate = updatedData.taxRate !== undefined ? updatedData.taxRate : existingInvoice.taxRate;

    if (updatedData.items || updatedData.taxRate !== undefined) {
      let calculatedSubtotal = mergedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      subtotal = Math.round(calculatedSubtotal);
      taxAmount = Math.round(subtotal * (mergedTaxRate / 100));
      totalUsd = subtotal + taxAmount;
    }

    const updated = await apiFetch<any>(`/api/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        clientId: updatedData.client ? updatedData.client.id : undefined,
        status: updatedData.status,
        issueDate: updatedData.issueDate ? convertFrenchDateToDb(updatedData.issueDate) : undefined,
        dueDate: updatedData.dueDate ? convertFrenchDateToDb(updatedData.dueDate) : undefined,
        subtotal,
        taxRate: mergedTaxRate,
        taxAmount,
        totalUsd,
        notes: updatedData.notes,
        items: updatedData.items,
      }),
    });

    const refreshedInvoice: Invoice = {
      ...updated,
      issueDate: convertDbDateToFrench(updated.issueDate),
      dueDate: convertDbDateToFrench(updated.dueDate),
    };

    setInvoices(prev => prev.map(inv => (inv.id === id ? refreshedInvoice : inv)));
  };

  const deleteInvoice = async (id: string) => {
    await apiFetch(`/api/invoices/${id}`, { method: 'DELETE' });
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    await apiFetch(`/api/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  // SETTINGS CRUD
  const updateSettings = async (newSettings: Partial<CompanySettings>) => {
    if (!user) throw new Error('User not authenticated');

    const updated = await apiFetch<CompanySettings>('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({
        companyName: newSettings.companyName,
        email: newSettings.email,
        phone: newSettings.phone,
        address: newSettings.address,
        taxNumber: newSettings.taxNumber,
        taxRate: newSettings.taxRate,
        mobileMoneyDetails: newSettings.mobileMoneyDetails,
        currency: newSettings.currency,
      }),
    });

    setSettings(updated);
  };

  const setLogoUrl = (logoUrl: string) => {
    setSettings(prev => ({ ...prev, logoUrl }));
  };

  // PAYMENTS CRUD
  const addPayment = async (paymentData: Omit<Payment, 'id' | 'invoiceNumber' | 'clientName' | 'currency'>) => {
    const linkedInvoice = invoices.find(inv => inv.id === paymentData.invoiceId);
    if (!linkedInvoice) throw new Error('Invoice not found');

    const created = await apiFetch<any>('/api/payments', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: paymentData.invoiceId,
        amountUsd: paymentData.amountUsd,
        method: paymentData.method,
        reference: paymentData.reference,
        date: convertFrenchDateToDb(paymentData.date),
      }),
    });

    const newPayment: Payment = { ...created, date: convertDbDateToFrench(created.date) };

    setPayments(prev => [newPayment, ...prev]);

    // Optional: Auto update invoice status to paid if payment amount matches total
    if (paymentData.amountUsd >= linkedInvoice.totalUsd) {
      await updateInvoiceStatus(linkedInvoice.id, 'paid');
    }

    return newPayment;
  };

  // REFUNDS CRUD
  const addRefund = async (refundData: Omit<Refund, 'id' | 'invoiceNumber' | 'clientName' | 'currency'>) => {
    const linkedInvoice = invoices.find(inv => inv.id === refundData.invoiceId);
    if (!linkedInvoice) throw new Error('Invoice not found');

    const created = await apiFetch<any>('/api/refunds', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: refundData.invoiceId,
        amountUsd: refundData.amountUsd,
        status: refundData.status || 'pending',
        reason: refundData.reason,
        date: convertFrenchDateToDb(refundData.date),
      }),
    });

    const newRefund: Refund = { ...created, date: convertDbDateToFrench(created.date) };

    setRefunds(prev => [newRefund, ...prev]);
    return newRefund;
  };

  // QUOTES CRUD
  const addQuote = async (quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'total' | 'taxAmount' | 'subtotal' | 'convertedInvoiceId'>) => {
    let calculatedSubtotal = 0;
    if (quoteData.items) {
      calculatedSubtotal = quoteData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    const subtotal = Math.round(calculatedSubtotal);
    const taxAmount = Math.round(subtotal * (quoteData.taxRate / 100));
    const total = subtotal + taxAmount;
    const quoteNumber = getNextQuoteNumber();

    const created = await apiFetch<{ id: string; items: Quote['items'] }>('/api/quotes', {
      method: 'POST',
      body: JSON.stringify({
        quoteNumber,
        clientId: quoteData.client.id,
        status: quoteData.status,
        issueDate: convertFrenchDateToDb(quoteData.issueDate),
        validUntil: convertFrenchDateToDb(quoteData.validUntil),
        subtotal,
        taxRate: quoteData.taxRate,
        taxAmount,
        total,
        currency: quoteData.currency,
        notes: quoteData.notes || '',
        items: quoteData.items || [],
      }),
    });

    const newQuote: Quote = {
      ...quoteData,
      id: created.id,
      quoteNumber,
      subtotal,
      taxAmount,
      total,
      convertedInvoiceId: null,
      items: created.items,
    };

    setQuotes(prev => [newQuote, ...prev]);
    return newQuote;
  };

  const updateQuote = async (id: string, updatedData: Partial<Quote>) => {
    let subtotal = updatedData.subtotal;
    let taxAmount = updatedData.taxAmount;
    let total = updatedData.total;

    const existingQuote = quotes.find(q => q.id === id);
    if (!existingQuote) return;

    const mergedItems = updatedData.items || existingQuote.items || [];
    const mergedTaxRate = updatedData.taxRate !== undefined ? updatedData.taxRate : existingQuote.taxRate;

    if (updatedData.items || updatedData.taxRate !== undefined) {
      const calculatedSubtotal = mergedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      subtotal = Math.round(calculatedSubtotal);
      taxAmount = Math.round(subtotal * (mergedTaxRate / 100));
      total = subtotal + taxAmount;
    }

    const updated = await apiFetch<any>(`/api/quotes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        clientId: updatedData.client ? updatedData.client.id : undefined,
        status: updatedData.status,
        issueDate: updatedData.issueDate ? convertFrenchDateToDb(updatedData.issueDate) : undefined,
        validUntil: updatedData.validUntil ? convertFrenchDateToDb(updatedData.validUntil) : undefined,
        subtotal,
        taxRate: mergedTaxRate,
        taxAmount,
        total,
        notes: updatedData.notes,
        items: updatedData.items,
      }),
    });

    const refreshedQuote: Quote = {
      ...updated,
      issueDate: convertDbDateToFrench(updated.issueDate),
      validUntil: convertDbDateToFrench(updated.validUntil),
    };

    setQuotes(prev => prev.map(q => (q.id === id ? refreshedQuote : q)));
  };

  const deleteQuote = async (id: string) => {
    await apiFetch(`/api/quotes/${id}`, { method: 'DELETE' });
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  const updateQuoteStatus = async (id: string, status: QuoteStatus) => {
    await apiFetch(`/api/quotes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };

  const convertQuoteToInvoice = async (id: string) => {
    const created = await apiFetch<any>(`/api/quotes/${id}/convert`, { method: 'POST' });

    const newInvoice: Invoice = {
      ...created,
      issueDate: convertDbDateToFrench(created.issueDate),
      dueDate: convertDbDateToFrench(created.dueDate),
    };

    setInvoices(prev => [newInvoice, ...prev]);
    setQuotes(prev => prev.map(q => (q.id === id ? { ...q, convertedInvoiceId: newInvoice.id } : q)));
    return newInvoice;
  };

  // DOWN PAYMENTS (ACOMPTES) CRUD
  const addDownPayment = async (downPaymentData: Omit<DownPayment, 'id' | 'downPaymentNumber' | 'invoiceNumber'>) => {
    const downPaymentNumber = getNextDownPaymentNumber();

    const created = await apiFetch<any>('/api/down-payments', {
      method: 'POST',
      body: JSON.stringify({
        downPaymentNumber,
        clientId: downPaymentData.client.id,
        invoiceId: downPaymentData.invoiceId || null,
        status: downPaymentData.status,
        issueDate: convertFrenchDateToDb(downPaymentData.issueDate),
        description: downPaymentData.description,
        amount: downPaymentData.amount,
        currency: downPaymentData.currency,
        notes: downPaymentData.notes || '',
      }),
    });

    const newDownPayment: DownPayment = {
      ...created,
      issueDate: convertDbDateToFrench(created.issueDate),
    };

    setDownPayments(prev => [newDownPayment, ...prev]);
    return newDownPayment;
  };

  const updateDownPayment = async (id: string, updatedData: Partial<DownPayment>) => {
    const updated = await apiFetch<any>(`/api/down-payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        clientId: updatedData.client ? updatedData.client.id : undefined,
        invoiceId: updatedData.invoiceId,
        status: updatedData.status,
        issueDate: updatedData.issueDate ? convertFrenchDateToDb(updatedData.issueDate) : undefined,
        description: updatedData.description,
        amount: updatedData.amount,
        notes: updatedData.notes,
      }),
    });

    const refreshed: DownPayment = { ...updated, issueDate: convertDbDateToFrench(updated.issueDate) };
    setDownPayments(prev => prev.map(d => (d.id === id ? refreshed : d)));
  };

  const deleteDownPayment = async (id: string) => {
    await apiFetch(`/api/down-payments/${id}`, { method: 'DELETE' });
    setDownPayments(prev => prev.filter(d => d.id !== id));
  };

  const updateDownPaymentStatus = async (id: string, status: DownPaymentStatus) => {
    await apiFetch(`/api/down-payments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    setDownPayments(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  // CREDIT NOTES (AVOIRS) CRUD
  const addCreditNote = async (creditNoteData: Omit<CreditNote, 'id' | 'creditNoteNumber' | 'invoiceNumber' | 'clientName' | 'currency'>) => {
    const creditNoteNumber = getNextCreditNoteNumber();

    const created = await apiFetch<any>('/api/credit-notes', {
      method: 'POST',
      body: JSON.stringify({
        creditNoteNumber,
        invoiceId: creditNoteData.invoiceId,
        status: creditNoteData.status,
        issueDate: convertFrenchDateToDb(creditNoteData.issueDate),
        amount: creditNoteData.amount,
        reason: creditNoteData.reason,
      }),
    });

    const newCreditNote: CreditNote = { ...created, issueDate: convertDbDateToFrench(created.issueDate) };

    setCreditNotes(prev => [newCreditNote, ...prev]);
    return newCreditNote;
  };

  const deleteCreditNote = async (id: string) => {
    await apiFetch(`/api/credit-notes/${id}`, { method: 'DELETE' });
    setCreditNotes(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AppContext.Provider value={{
      clients,
      invoices,
      settings,
      payments,
      refunds,
      quotes,
      downPayments,
      creditNotes,
      loading,
      user,
      authLoading,
      addClient,
      updateClient,
      deleteClient,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      updateInvoiceStatus,
      getNextInvoiceNumber,
      updateSettings,
      setLogoUrl,
      addPayment,
      addRefund,
      addQuote,
      updateQuote,
      deleteQuote,
      updateQuoteStatus,
      convertQuoteToInvoice,
      getNextQuoteNumber,
      addDownPayment,
      updateDownPayment,
      deleteDownPayment,
      updateDownPaymentStatus,
      getNextDownPaymentNumber,
      addCreditNote,
      deleteCreditNote,
      getNextCreditNoteNumber
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
