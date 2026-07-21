'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Client, Invoice, InvoiceStatus, CompanySettings, Payment, Refund } from '@/types';
import { apiFetch } from '@/lib/api-client';

type SessionUser = { id: string; email?: string | null };

interface AppContextType {
  clients: Client[];
  invoices: Invoice[];
  settings: CompanySettings;
  payments: Payment[];
  refunds: Refund[];
  exchangeRate: number;
  loading: boolean;
  user: SessionUser | null;
  authLoading: boolean;
  addClient: (client: Omit<Client, 'id'>) => Promise<Client>;
  updateClient: (id: string, updatedClient: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'totalUsd' | 'totalCdf' | 'taxAmount' | 'subtotal' | 'exchangeRate'>) => Promise<Invoice>;
  updateInvoice: (id: string, updatedInvoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  getNextInvoiceNumber: () => string;
  updateSettings: (newSettings: Partial<CompanySettings>) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id' | 'invoiceNumber' | 'clientName' | 'amountCdf'>) => Promise<Payment>;
  addRefund: (refund: Omit<Refund, 'id' | 'invoiceNumber' | 'clientName' | 'amountCdf'>) => Promise<Refund>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: 'Bruno Z. Consulting',
  email: 'contact@bruno.cd',
  phone: '+243 812 345 678',
  address: 'Gombe, Kinshasa, République Démocratique du Congo',
  taxNumber: 'CD/KIN/RCCM/26-B-0042',
  currency: 'USD',
  taxRate: 18,
  exchangeRate: 2800,
  mobileMoneyDetails: 'M-Pesa: +243 812 345 678 | Orange Money: +243 897 111 222',
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
    ? { id: session.user.id, email: session.user.email }
    : null;
  const authLoading = status === 'loading';

  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);

  const exchangeRate = settings.exchangeRate;

  const fetchData = async () => {
    try {
      setLoading(true);

      const [settingsData, clientsData, invoicesData, paymentsData, refundsData] = await Promise.all([
        apiFetch<CompanySettings>('/api/settings'),
        apiFetch<Client[]>('/api/clients'),
        apiFetch<any[]>('/api/invoices'),
        apiFetch<any[]>('/api/payments'),
        apiFetch<any[]>('/api/refunds'),
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

  // CLIENTS CRUD
  const addClient = async (newClientData: Omit<Client, 'id'>) => {
    const newClient = await apiFetch<Client>('/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        address: newClientData.address,
        country: newClientData.country || 'CD',
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
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'totalUsd' | 'totalCdf' | 'taxAmount' | 'subtotal' | 'exchangeRate'>) => {
    let calculatedSubtotal = 0;
    if (invoiceData.items) {
      calculatedSubtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    const subtotal = Math.round(calculatedSubtotal);
    const taxAmount = Math.round(subtotal * (invoiceData.taxRate / 100));
    const totalUsd = subtotal + taxAmount;
    const totalCdf = totalUsd * exchangeRate;
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
        totalCdf,
        exchangeRate,
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
      totalCdf,
      exchangeRate,
      items: created.items,
    };

    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = async (id: string, updatedData: Partial<Invoice>) => {
    let subtotal = updatedData.subtotal;
    let taxAmount = updatedData.taxAmount;
    let totalUsd = updatedData.totalUsd;
    let totalCdf = updatedData.totalCdf;

    const existingInvoice = invoices.find(inv => inv.id === id);
    if (!existingInvoice) return;

    const mergedItems = updatedData.items || existingInvoice.items || [];
    const mergedTaxRate = updatedData.taxRate !== undefined ? updatedData.taxRate : existingInvoice.taxRate;

    if (updatedData.items || updatedData.taxRate !== undefined) {
      let calculatedSubtotal = mergedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      subtotal = Math.round(calculatedSubtotal);
      taxAmount = Math.round(subtotal * (mergedTaxRate / 100));
      totalUsd = subtotal + taxAmount;
      totalCdf = totalUsd * existingInvoice.exchangeRate;
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
        totalCdf,
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
        currency: newSettings.currency,
        taxRate: newSettings.taxRate,
        exchangeRate: newSettings.exchangeRate,
        mobileMoneyDetails: newSettings.mobileMoneyDetails,
      }),
    });

    setSettings(updated);
  };

  // PAYMENTS CRUD
  const addPayment = async (paymentData: Omit<Payment, 'id' | 'invoiceNumber' | 'clientName' | 'amountCdf'>) => {
    const linkedInvoice = invoices.find(inv => inv.id === paymentData.invoiceId);
    if (!linkedInvoice) throw new Error('Invoice not found');

    const amountCdf = paymentData.amountUsd * exchangeRate;

    const created = await apiFetch<any>('/api/payments', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: paymentData.invoiceId,
        amountUsd: paymentData.amountUsd,
        amountCdf,
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
  const addRefund = async (refundData: Omit<Refund, 'id' | 'invoiceNumber' | 'clientName' | 'amountCdf'>) => {
    const linkedInvoice = invoices.find(inv => inv.id === refundData.invoiceId);
    if (!linkedInvoice) throw new Error('Invoice not found');

    const amountCdf = refundData.amountUsd * exchangeRate;

    const created = await apiFetch<any>('/api/refunds', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: refundData.invoiceId,
        amountUsd: refundData.amountUsd,
        amountCdf,
        status: refundData.status || 'pending',
        reason: refundData.reason,
        date: convertFrenchDateToDb(refundData.date),
      }),
    });

    const newRefund: Refund = { ...created, date: convertDbDateToFrench(created.date) };

    setRefunds(prev => [newRefund, ...prev]);
    return newRefund;
  };

  return (
    <AppContext.Provider value={{
      clients,
      invoices,
      settings,
      payments,
      refunds,
      exchangeRate,
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
      addPayment,
      addRefund
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
