import { Currency } from '@/lib/currency';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type DownPaymentStatus = 'draft' | 'sent' | 'paid';
export type CreditNoteStatus = 'draft' | 'issued';
export type ClientCategory = 'individual' | 'business';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  category: ClientCategory;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: Client;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items?: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalUsd: number;
  currency: Currency;
  notes?: string;
}

export interface CompanySettings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  taxRate: number;
  mobileMoneyDetails: string;
  logoUrl: string;
  currency: Currency;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amountUsd: number;
  currency: Currency;
  method: 'cash' | 'mobile_money' | 'bank';
  reference: string;
  date: string;
}

export interface Refund {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amountUsd: number;
  currency: Currency;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  date: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  client: Client;
  status: QuoteStatus;
  issueDate: string;
  validUntil: string;
  items?: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: Currency;
  notes?: string;
  convertedInvoiceId?: string | null;
}

export interface DownPayment {
  id: string;
  downPaymentNumber: string;
  client: Client;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  status: DownPaymentStatus;
  issueDate: string;
  description: string;
  amount: number;
  currency: Currency;
  notes?: string;
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  status: CreditNoteStatus;
  issueDate: string;
  amount: number;
  reason: string;
  currency: Currency;
}

