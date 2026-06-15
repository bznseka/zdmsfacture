export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
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
  taxRate: number; // 18% standard DRC
  taxAmount: number;
  totalUsd: number;
  totalCdf: number;
  exchangeRate: number;
  notes?: string;
}

export interface DashboardStats {
  totalInvoices: number;
  totalRevenueUsd: number;
  totalRevenueCdf: number;
  totalPaidUsd: number;
  totalPaidCdf: number;
  totalPendingUsd: number;
  totalPendingCdf: number;
  totalOverdueUsd: number;
  totalOverdueCdf: number;
  revenueGrowth: number; // % comparison vs previous month
}

export interface CompanySettings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  currency: string;
  taxRate: number;
  exchangeRate: number;
  mobileMoneyDetails: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amountUsd: number;
  amountCdf: number;
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
  amountCdf: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  date: string;
}

