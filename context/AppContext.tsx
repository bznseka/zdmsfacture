'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, Invoice, InvoiceStatus, CompanySettings, Payment, Refund } from '@/types';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AppContextType {
  clients: Client[];
  invoices: Invoice[];
  settings: CompanySettings;
  payments: Payment[];
  refunds: Refund[];
  exchangeRate: number;
  loading: boolean;
  user: User | null;
  session: Session | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: 'Bruno Z. Consulting',
    email: 'contact@bruno.cd',
    phone: '+243 812 345 678',
    address: 'Gombe, Kinshasa, République Démocratique du Congo',
    taxNumber: 'CD/KIN/RCCM/26-B-0042',
    currency: 'USD',
    taxRate: 18,
    exchangeRate: 2800,
    mobileMoneyDetails: 'M-Pesa: +243 812 345 678 | Orange Money: +243 897 111 222',
  });

  const exchangeRate = settings.exchangeRate;

  // Initial data loading from Supabase
  const fetchData = async (currentUser: User) => {
    try {
      setLoading(true);

      // 1. Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      if (settingsData) {
        setSettings({
          companyName: settingsData.company_name,
          email: settingsData.email,
          phone: settingsData.phone,
          address: settingsData.address,
          taxNumber: settingsData.tax_number,
          currency: settingsData.currency,
          taxRate: Number(settingsData.tax_rate),
          exchangeRate: Number(settingsData.exchange_rate),
          mobileMoneyDetails: settingsData.mobile_money_details,
        });
      } else {
        // Create default settings for this user if they don't exist
        const defaultSettings = {
          user_id: currentUser.id,
          company_name: 'Bruno Z. Consulting',
          email: currentUser.email || 'contact@bruno.cd',
          phone: '+243 812 345 678',
          address: 'Gombe, Kinshasa, République Démocratique du Congo',
          tax_number: 'CD/KIN/RCCM/26-B-0042',
          currency: 'USD',
          tax_rate: 18,
          exchange_rate: 2800,
          mobile_money_details: 'M-Pesa: +243 812 345 678 | Orange Money: +243 897 111 222',
        };

        const { data: newSettings, error: insertError } = await supabase
          .from('settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (!insertError && newSettings) {
          setSettings({
            companyName: newSettings.company_name,
            email: newSettings.email,
            phone: newSettings.phone,
            address: newSettings.address,
            taxNumber: newSettings.tax_number,
            currency: newSettings.currency,
            taxRate: Number(newSettings.tax_rate),
            exchangeRate: Number(newSettings.exchange_rate),
            mobileMoneyDetails: newSettings.mobile_money_details,
          });
        }
      }

      // 2. Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (!clientsError && clientsData) {
        setClients(clientsData.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          address: c.address || '',
          country: c.country || 'CD',
        })));
      }

      // 3. Fetch invoices with related client and items
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*, client:clients(*), items:invoice_items(*)')
        .order('created_at', { ascending: false });
      
      if (!invoicesError && invoicesData) {
        setInvoices(invoicesData.map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          status: inv.status as InvoiceStatus,
          issueDate: convertDbDateToFrench(inv.issue_date),
          dueDate: convertDbDateToFrench(inv.due_date),
          subtotal: Number(inv.subtotal),
          taxRate: Number(inv.tax_rate),
          taxAmount: Number(inv.tax_amount),
          totalUsd: Number(inv.total_usd),
          totalCdf: Number(inv.total_cdf),
          exchangeRate: Number(inv.exchange_rate),
          notes: inv.notes || '',
          client: inv.client ? {
            id: inv.client.id,
            name: inv.client.name,
            email: inv.client.email,
            phone: inv.client.phone || '',
            address: inv.client.address || '',
            country: inv.client.country || 'CD',
          } : {
            id: '',
            name: 'Client Inconnu',
            email: '',
            phone: '',
            address: '',
            country: 'CD',
          },
          items: inv.items ? inv.items.map((item: any) => ({
            id: item.id,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unit_price),
            total: Number(item.total)
          })) : []
        })));
      }

      // 4. Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*, invoice:invoices(*, client:clients(*))')
        .order('created_at', { ascending: false });

      if (!paymentsError && paymentsData) {
        setPayments(paymentsData.map(p => ({
          id: p.id,
          invoiceId: p.invoice_id,
          invoiceNumber: p.invoice?.invoice_number || 'INV-XXXX',
          clientName: p.invoice?.client?.name || 'Client Inconnu',
          amountUsd: Number(p.amount_usd),
          amountCdf: Number(p.amount_cdf),
          method: p.method as Payment['method'],
          reference: p.reference || '',
          date: convertDbDateToFrench(p.date),
        })));
      }

      // 5. Fetch refunds
      const { data: refundsData, error: refundsError } = await supabase
        .from('refunds')
        .select('*, invoice:invoices(*, client:clients(*))')
        .order('created_at', { ascending: false });

      if (!refundsError && refundsData) {
        setRefunds(refundsData.map(r => ({
          id: r.id,
          invoiceId: r.invoice_id,
          invoiceNumber: r.invoice?.invoice_number || 'INV-XXXX',
          clientName: r.invoice?.client?.name || 'Client Inconnu',
          amountUsd: Number(r.amount_usd),
          amountCdf: Number(r.amount_cdf),
          status: r.status as Refund['status'],
          reason: r.reason || '',
          date: convertDbDateToFrench(r.date),
        })));
      }

    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  // Listen to Auth State Changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch or reset on Auth state changes
  useEffect(() => {
    if (user) {
      fetchData(user);
    } else {
      setClients([]);
      setInvoices([]);
      setPayments([]);
      setRefunds([]);
      setSettings({
        companyName: 'Bruno Z. Consulting',
        email: 'contact@bruno.cd',
        phone: '+243 812 345 678',
        address: 'Gombe, Kinshasa, République Démocratique du Congo',
        taxNumber: 'CD/KIN/RCCM/26-B-0042',
        currency: 'USD',
        taxRate: 18,
        exchangeRate: 2800,
        mobileMoneyDetails: 'M-Pesa: +243 812 345 678 | Orange Money: +243 897 111 222',
      });
      setLoading(false);
    }
  }, [user]);

  // Generate next sequential invoice number in format INV-YYYY-NNNN
  const getNextInvoiceNumber = () => {
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;
    
    const yearInvoices = invoices.filter(inv => inv.invoiceNumber.startsWith(prefix));
    
    if (yearInvoices.length === 0) {
      return `${prefix}0043`; // Offset matching mock highest number
    }
    
    const numbers = yearInvoices.map(inv => {
      const parts = inv.invoiceNumber.split('-');
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    });
    
    const maxNum = Math.max(...numbers, 42);
    const nextNum = maxNum + 1;
    return `${prefix}${nextNum.toString().padStart(4, '0')}`;
  };

  // CLIENTS CRUD
  const addClient = async (newClientData: Omit<Client, 'id'>) => {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        address: newClientData.address,
        country: newClientData.country || 'CD',
      })
      .select()
      .single();

    if (error) throw error;

    const newClient: Client = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      address: data.address || '',
      country: data.country || 'CD',
    };

    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = async (id: string, updatedClient: Partial<Client>) => {
    const { error } = await supabase
      .from('clients')
      .update({
        name: updatedClient.name,
        email: updatedClient.email,
        phone: updatedClient.phone,
        address: updatedClient.address,
        country: updatedClient.country,
      })
      .eq('id', id);

    if (error) throw error;

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
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;

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

    // 1. Insert invoice header
    const { data: dbInvoice, error: invError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        client_id: invoiceData.client.id,
        status: invoiceData.status,
        issue_date: convertFrenchDateToDb(invoiceData.issueDate),
        due_date: convertFrenchDateToDb(invoiceData.dueDate),
        subtotal,
        tax_rate: invoiceData.taxRate,
        tax_amount: taxAmount,
        total_usd: totalUsd,
        total_cdf: totalCdf,
        exchange_rate: exchangeRate,
        notes: invoiceData.notes || '',
      })
      .select()
      .single();

    if (invError) throw invError;

    // 2. Insert items
    let insertedItemsData: any[] = [];
    if (invoiceData.items && invoiceData.items.length > 0) {
      const itemsToInsert = invoiceData.items.map(item => ({
        invoice_id: dbInvoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total
      }));

      const { data: dbItems, error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;
      insertedItemsData = dbItems || [];
    }

    const newInvoice: Invoice = {
      ...invoiceData,
      id: dbInvoice.id,
      invoiceNumber,
      subtotal,
      taxAmount,
      totalUsd,
      totalCdf,
      exchangeRate,
      items: insertedItemsData.map(item => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        total: Number(item.total)
      }))
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

    // Update main invoice table
    const { error: invError } = await supabase
      .from('invoices')
      .update({
        client_id: updatedData.client ? updatedData.client.id : undefined,
        status: updatedData.status,
        issue_date: updatedData.issueDate ? convertFrenchDateToDb(updatedData.issueDate) : undefined,
        due_date: updatedData.dueDate ? convertFrenchDateToDb(updatedData.dueDate) : undefined,
        subtotal,
        tax_rate: mergedTaxRate,
        tax_amount: taxAmount,
        total_usd: totalUsd,
        total_cdf: totalCdf,
        notes: updatedData.notes,
      })
      .eq('id', id);

    if (invError) throw invError;

    // Update items list
    if (updatedData.items) {
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      if (deleteError) throw deleteError;

      if (updatedData.items.length > 0) {
        const itemsToInsert = updatedData.items.map(item => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }
    }

    // Refresh invoices list
    const { data: invoicesData, error: refreshError } = await supabase
      .from('invoices')
      .select('*, client:clients(*), items:invoice_items(*)')
      .order('created_at', { ascending: false });
    
    if (!refreshError && invoicesData) {
      setInvoices(invoicesData.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        status: inv.status as InvoiceStatus,
        issueDate: convertDbDateToFrench(inv.issue_date),
        dueDate: convertDbDateToFrench(inv.due_date),
        subtotal: Number(inv.subtotal),
        taxRate: Number(inv.tax_rate),
        taxAmount: Number(inv.tax_amount),
        totalUsd: Number(inv.total_usd),
        totalCdf: Number(inv.total_cdf),
        exchangeRate: Number(inv.exchange_rate),
        notes: inv.notes || '',
        client: inv.client ? {
          id: inv.client.id,
          name: inv.client.name,
          email: inv.client.email,
          phone: inv.client.phone || '',
          address: inv.client.address || '',
          country: inv.client.country || 'CD',
        } : {
          id: '',
          name: 'Client Inconnu',
          email: '',
          phone: '',
          address: '',
          country: 'CD',
        },
        items: inv.items ? inv.items.map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          total: Number(item.total)
        })) : []
      })));
    }
  };

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    const { error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  // SETTINGS CRUD
  const updateSettings = async (newSettings: Partial<CompanySettings>) => {
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase
      .from('settings')
      .update({
        company_name: newSettings.companyName,
        email: newSettings.email,
        phone: newSettings.phone,
        address: newSettings.address,
        tax_number: newSettings.taxNumber,
        currency: newSettings.currency,
        tax_rate: newSettings.taxRate,
        exchange_rate: newSettings.exchangeRate,
        mobile_money_details: newSettings.mobileMoneyDetails,
        updated_at: new Date()
      })
      .eq('user_id', user.id);

    if (error) throw error;
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // PAYMENTS CRUD
  const addPayment = async (paymentData: Omit<Payment, 'id' | 'invoiceNumber' | 'clientName' | 'amountCdf'>) => {
    const linkedInvoice = invoices.find(inv => inv.id === paymentData.invoiceId);
    if (!linkedInvoice) throw new Error('Invoice not found');

    const amountCdf = paymentData.amountUsd * exchangeRate;

    const { data: dbPayment, error } = await supabase
      .from('payments')
      .insert({
        invoice_id: paymentData.invoiceId,
        amount_usd: paymentData.amountUsd,
        amount_cdf: amountCdf,
        method: paymentData.method,
        reference: paymentData.reference,
        date: convertFrenchDateToDb(paymentData.date),
      })
      .select()
      .single();

    if (error) throw error;

    const newPayment: Payment = {
      id: dbPayment.id,
      invoiceId: dbPayment.invoice_id,
      invoiceNumber: linkedInvoice.invoiceNumber,
      clientName: linkedInvoice.client.name,
      amountUsd: Number(dbPayment.amount_usd),
      amountCdf: Number(dbPayment.amount_cdf),
      method: dbPayment.method as Payment['method'],
      reference: dbPayment.reference || '',
      date: convertDbDateToFrench(dbPayment.date),
    };

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

    const { data: dbRefund, error } = await supabase
      .from('refunds')
      .insert({
        invoice_id: refundData.invoiceId,
        amount_usd: refundData.amountUsd,
        amount_cdf: amountCdf,
        status: refundData.status || 'pending',
        reason: refundData.reason,
        date: convertFrenchDateToDb(refundData.date),
      })
      .select()
      .single();

    if (error) throw error;

    const newRefund: Refund = {
      id: dbRefund.id,
      invoiceId: dbRefund.invoice_id,
      invoiceNumber: linkedInvoice.invoiceNumber,
      clientName: linkedInvoice.client.name,
      amountUsd: Number(dbRefund.amount_usd),
      amountCdf: Number(dbRefund.amount_cdf),
      status: dbRefund.status as Refund['status'],
      reason: dbRefund.reason || '',
      date: convertDbDateToFrench(dbRefund.date),
    };

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
      session,
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
