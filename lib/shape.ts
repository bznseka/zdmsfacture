type ClientRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  country: string | null;
};

type ItemRow = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
};

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  totalUsd: string;
  totalCdf: string;
  exchangeRate: string;
  notes: string | null;
};

export function shapeClient(row: ClientRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    address: row.address || "",
    country: row.country || "CD",
  };
}

export function shapeItem(row: ItemRow) {
  return {
    id: row.id,
    description: row.description,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unitPrice),
    total: Number(row.total),
  };
}

const UNKNOWN_CLIENT = {
  id: "",
  name: "Client Inconnu",
  email: "",
  phone: "",
  address: "",
  country: "CD",
};

export function shapeInvoice(
  row: InvoiceRow,
  client: ClientRow | null | undefined,
  items: ItemRow[]
) {
  return {
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    status: row.status,
    issueDate: row.issueDate,
    dueDate: row.dueDate,
    subtotal: Number(row.subtotal),
    taxRate: Number(row.taxRate),
    taxAmount: Number(row.taxAmount),
    totalUsd: Number(row.totalUsd),
    totalCdf: Number(row.totalCdf),
    exchangeRate: Number(row.exchangeRate),
    notes: row.notes || "",
    client: client ? shapeClient(client) : UNKNOWN_CLIENT,
    items: items.map(shapeItem),
  };
}

export function shapePayment(
  row: {
    id: string;
    invoiceId: string;
    amountUsd: string;
    amountCdf: string;
    method: string;
    reference: string | null;
    date: string;
  },
  invoiceNumber: string | undefined,
  clientName: string | undefined
) {
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    invoiceNumber: invoiceNumber || "INV-XXXX",
    clientName: clientName || "Client Inconnu",
    amountUsd: Number(row.amountUsd),
    amountCdf: Number(row.amountCdf),
    method: row.method,
    reference: row.reference || "",
    date: row.date,
  };
}

export function shapeRefund(
  row: {
    id: string;
    invoiceId: string;
    amountUsd: string;
    amountCdf: string;
    status: string;
    reason: string | null;
    date: string;
  },
  invoiceNumber: string | undefined,
  clientName: string | undefined
) {
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    invoiceNumber: invoiceNumber || "INV-XXXX",
    clientName: clientName || "Client Inconnu",
    amountUsd: Number(row.amountUsd),
    amountCdf: Number(row.amountCdf),
    status: row.status,
    reason: row.reason || "",
    date: row.date,
  };
}

export function shapeSettings(row: {
  companyName: string;
  email: string;
  phone: string | null;
  address: string;
  taxNumber: string | null;
  currency: string;
  taxRate: string;
  exchangeRate: string;
  mobileMoneyDetails: string | null;
}) {
  return {
    companyName: row.companyName,
    email: row.email,
    phone: row.phone || "",
    address: row.address,
    taxNumber: row.taxNumber || "",
    currency: row.currency,
    taxRate: Number(row.taxRate),
    exchangeRate: Number(row.exchangeRate),
    mobileMoneyDetails: row.mobileMoneyDetails || "",
  };
}
