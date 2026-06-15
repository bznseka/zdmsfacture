import { Invoice, Client, DashboardStats } from '../types';

export const EXCHANGE_RATE = 2800; // 1 USD = 2800 CDF (Standard DRC rate)

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Vodacom Congo RDC',
    email: 'finance@vodacom.cd',
    phone: '+243 812 345 678',
    address: 'Boulevard du 30 Juin, Kinshasa Gombe',
    country: 'CD',
  },
  {
    id: 'c2',
    name: 'Rawbank SARL',
    email: 'invoicing@rawbank.cd',
    phone: '+243 998 765 432',
    address: '34, Avenue Kimbondo, Lubumbashi',
    country: 'CD',
  },
  {
    id: 'c3',
    name: 'Bralima RDC',
    email: 'accounting@bralima.cd',
    phone: '+243 897 111 222',
    address: 'Avenue du Drapeau, Kinshasa Barumbu',
    country: 'CD',
  },
  {
    id: 'c4',
    name: 'Orange RDC',
    email: 'partners@orange.cd',
    phone: '+243 808 555 444',
    address: 'Immeuble Orange, Kinshasa Gombe',
    country: 'CD',
  },
  {
    id: 'c5',
    name: 'Gecamines SA',
    email: 'info@gecamines.cd',
    phone: '+243 222 333 444',
    address: 'Route Likasi, Lubumbashi',
    country: 'CD',
  },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0042',
    client: MOCK_CLIENTS[0],
    status: 'paid',
    issueDate: '12/06/2026',
    dueDate: '12/07/2026',
    subtotal: 12500.00,
    taxRate: 18.00,
    taxAmount: 2250.00,
    totalUsd: 14750.00,
    totalCdf: 14750.00 * EXCHANGE_RATE,
    exchangeRate: EXCHANGE_RATE,
    notes: 'Prestations de conseil IT - Juin 2026',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0041',
    client: MOCK_CLIENTS[1],
    status: 'sent',
    issueDate: '08/06/2026',
    dueDate: '08/07/2026',
    subtotal: 8000.00,
    taxRate: 18.00,
    taxAmount: 1440.00,
    totalUsd: 9440.00,
    totalCdf: 9440.00 * EXCHANGE_RATE,
    exchangeRate: EXCHANGE_RATE,
    notes: 'Développement de module Web banking',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-0040',
    client: MOCK_CLIENTS[2],
    status: 'overdue',
    issueDate: '15/05/2026',
    dueDate: '15/06/2026',
    subtotal: 5500.00,
    taxRate: 18.00,
    taxAmount: 990.00,
    totalUsd: 6490.00,
    totalCdf: 6490.00 * EXCHANGE_RATE,
    exchangeRate: EXCHANGE_RATE,
    notes: 'Audit de sécurité des systèmes',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-0039',
    client: MOCK_CLIENTS[3],
    status: 'paid',
    issueDate: '28/05/2026',
    dueDate: '28/06/2026',
    subtotal: 18000.00,
    taxRate: 18.00,
    taxAmount: 3240.00,
    totalUsd: 21240.00,
    totalCdf: 21240.00 * EXCHANGE_RATE,
    exchangeRate: EXCHANGE_RATE,
    notes: 'Campagne marketing et communication',
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2026-0038',
    client: MOCK_CLIENTS[4],
    status: 'draft',
    issueDate: '14/06/2026',
    dueDate: '14/07/2026',
    subtotal: 35000.00,
    taxRate: 18.00,
    taxAmount: 6300.00,
    totalUsd: 41300.00,
    totalCdf: 41300.00 * EXCHANGE_RATE,
    exchangeRate: EXCHANGE_RATE,
    notes: 'Fourniture de matériel réseau Cisco',
  },
];

export const MOCK_STATS: DashboardStats = {
  totalInvoices: 45,
  totalRevenueUsd: 124500.00,
  totalRevenueCdf: 124500.00 * EXCHANGE_RATE,
  totalPaidUsd: 87200.00,
  totalPaidCdf: 87200.00 * EXCHANGE_RATE,
  totalPendingUsd: 24800.00,
  totalPendingCdf: 24800.00 * EXCHANGE_RATE,
  totalOverdueUsd: 12500.00,
  totalOverdueCdf: 12500.00 * EXCHANGE_RATE,
  revenueGrowth: 14.5,
};

// Monthly Income Statistics for the Bar Chart
export const MOCK_INCOME_STATS = [
  { month: 'Jan', income: 15000 },
  { month: 'Feb', income: 18500 },
  { month: 'Mar', income: 22000 },
  { month: 'Apr', income: 28000 },
  { month: 'May', income: 32000 },
  { month: 'Jun', income: 38500 },
];

// Invoice percentage by status for the Donut Chart
export const MOCK_STATUS_PERCENTAGE = [
  { name: 'Paid', value: 65, color: '#22C55E' },
  { name: 'Pending', value: 20, color: '#F59E0B' },
  { name: 'Overdue', value: 10, color: '#EF4444' },
  { name: 'Draft', value: 5, color: '#9CA3AF' },
];

// Top Clients by total billing
export const MOCK_TOP_CLIENTS = [
  { id: '1', name: 'Vodacom Congo', totalUsd: 48500.00, totalCdf: 48500.00 * EXCHANGE_RATE, invoicesCount: 12, initials: 'VC' },
  { id: '2', name: 'Rawbank SARL', totalUsd: 32400.00, totalCdf: 32400.00 * EXCHANGE_RATE, invoicesCount: 8, initials: 'RB' },
  { id: '3', name: 'Orange RDC', totalUsd: 28900.00, totalCdf: 28900.00 * EXCHANGE_RATE, invoicesCount: 6, initials: 'OR' },
  { id: '4', name: 'Bralima RDC', totalUsd: 15200.00, totalCdf: 15200.00 * EXCHANGE_RATE, invoicesCount: 4, initials: 'BR' },
];
