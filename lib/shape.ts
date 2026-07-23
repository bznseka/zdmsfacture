type ClientRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  country: string | null;
  category?: string;
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
  currency: string;
  notes: string | null;
};

export function shapeClient(row: ClientRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    address: row.address || "",
    country: row.country || "",
    category: (row.category as "individual" | "business") || "individual",
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
  country: "",
  category: "individual" as const,
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
    currency: (row.currency as "USD" | "EUR") || "USD",
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
    method: string;
    reference: string | null;
    date: string;
  },
  invoiceNumber: string | undefined,
  clientName: string | undefined,
  currency: string | undefined
) {
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    invoiceNumber: invoiceNumber || "INV-XXXX",
    clientName: clientName || "Client Inconnu",
    amountUsd: Number(row.amountUsd),
    currency: (currency as "USD" | "EUR") || "USD",
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
    status: string;
    reason: string | null;
    date: string;
  },
  invoiceNumber: string | undefined,
  clientName: string | undefined,
  currency: string | undefined
) {
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    invoiceNumber: invoiceNumber || "INV-XXXX",
    clientName: clientName || "Client Inconnu",
    amountUsd: Number(row.amountUsd),
    currency: (currency as "USD" | "EUR") || "USD",
    status: row.status,
    reason: row.reason || "",
    date: row.date,
  };
}

type QuoteRow = {
  id: string;
  quoteNumber: string;
  status: string;
  issueDate: string;
  validUntil: string;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  currency: string;
  notes: string | null;
  convertedInvoiceId: string | null;
};

export function shapeQuote(
  row: QuoteRow,
  client: ClientRow | null | undefined,
  items: ItemRow[]
) {
  return {
    id: row.id,
    quoteNumber: row.quoteNumber,
    status: row.status,
    issueDate: row.issueDate,
    validUntil: row.validUntil,
    subtotal: Number(row.subtotal),
    taxRate: Number(row.taxRate),
    taxAmount: Number(row.taxAmount),
    total: Number(row.total),
    currency: (row.currency as "USD" | "EUR") || "USD",
    notes: row.notes || "",
    convertedInvoiceId: row.convertedInvoiceId,
    client: client ? shapeClient(client) : UNKNOWN_CLIENT,
    items: items.map(shapeItem),
  };
}

export function shapeDownPayment(
  row: {
    id: string;
    downPaymentNumber: string;
    invoiceId: string | null;
    status: string;
    issueDate: string;
    description: string;
    amount: string;
    currency: string;
    notes: string | null;
  },
  client: ClientRow | null | undefined,
  invoiceNumber: string | null | undefined
) {
  return {
    id: row.id,
    downPaymentNumber: row.downPaymentNumber,
    invoiceId: row.invoiceId,
    invoiceNumber: invoiceNumber || null,
    status: row.status,
    issueDate: row.issueDate,
    description: row.description,
    amount: Number(row.amount),
    currency: (row.currency as "USD" | "EUR") || "USD",
    notes: row.notes || "",
    client: client ? shapeClient(client) : UNKNOWN_CLIENT,
  };
}

export function shapeCreditNote(
  row: {
    id: string;
    creditNoteNumber: string;
    invoiceId: string;
    status: string;
    issueDate: string;
    amount: string;
    reason: string;
    currency: string;
  },
  invoiceNumber: string | undefined,
  clientName: string | undefined
) {
  return {
    id: row.id,
    creditNoteNumber: row.creditNoteNumber,
    invoiceId: row.invoiceId,
    invoiceNumber: invoiceNumber || "INV-XXXX",
    clientName: clientName || "Client Inconnu",
    status: row.status,
    issueDate: row.issueDate,
    amount: Number(row.amount),
    reason: row.reason || "",
    currency: (row.currency as "USD" | "EUR") || "USD",
  };
}

export function shapeSettings(row: {
  companyName: string;
  email: string;
  phone: string | null;
  address: string;
  taxNumber: string | null;
  taxRate: string;
  mobileMoneyDetails: string | null;
  logoUrl: string | null;
  currency: string;
}) {
  return {
    companyName: row.companyName,
    email: row.email,
    phone: row.phone || "",
    address: row.address,
    taxNumber: row.taxNumber || "",
    taxRate: Number(row.taxRate),
    mobileMoneyDetails: row.mobileMoneyDetails || "",
    logoUrl: row.logoUrl || "",
    currency: (row.currency as "USD" | "EUR") || "USD",
  };
}
