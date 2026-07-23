import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  date,
  primaryKey,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("user"),
    status: text("status").notNull().default("active"),
    resetToken: text("reset_token").unique(),
    resetTokenExpiresAt: timestamp("reset_token_expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("users_role_check", sql`${table.role} in ('user','admin')`),
    check("users_status_check", sql`${table.status} in ('active','suspended')`),
  ]
);

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    address: text("address"),
    country: text("country"),
    category: text("category").notNull().default("individual"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    check("clients_category_check", sql`${table.category} in ('individual','business')`),
  ]
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceNumber: text("invoice_number").notNull(),
    clientId: uuid("client_id").references(() => clients.id),
    status: text("status").notNull().default("draft"),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    subtotal: numeric("subtotal").notNull().default("0"),
    taxRate: numeric("tax_rate").notNull().default("18"),
    taxAmount: numeric("tax_amount").notNull().default("0"),
    totalUsd: numeric("total_usd").notNull().default("0"),
    currency: text("currency").notNull().default("USD"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("invoices_user_id_invoice_number_key").on(table.userId, table.invoiceNumber),
    check(
      "invoices_status_check",
      sql`${table.status} in ('draft','sent','paid','overdue')`
    ),
    check("invoices_currency_check", sql`${table.currency} in ('USD','EUR')`),
  ]
);

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: numeric("quantity").notNull().default("1"),
  unitPrice: numeric("unit_price").notNull().default("0"),
  total: numeric("total").notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    amountUsd: numeric("amount_usd").notNull(),
    method: text("method").notNull(),
    reference: text("reference"),
    date: date("date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    check("payments_method_check", sql`${table.method} in ('cash','mobile_money','bank')`),
  ]
);

export const refunds = pgTable(
  "refunds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    amountUsd: numeric("amount_usd").notNull(),
    status: text("status").notNull().default("pending"),
    reason: text("reason").notNull(),
    date: date("date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    check("refunds_status_check", sql`${table.status} in ('pending','approved','rejected')`),
  ]
);

export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quoteNumber: text("quote_number").notNull(),
    clientId: uuid("client_id").references(() => clients.id),
    status: text("status").notNull().default("draft"),
    issueDate: date("issue_date").notNull(),
    validUntil: date("valid_until").notNull(),
    subtotal: numeric("subtotal").notNull().default("0"),
    taxRate: numeric("tax_rate").notNull().default("18"),
    taxAmount: numeric("tax_amount").notNull().default("0"),
    total: numeric("total").notNull().default("0"),
    currency: text("currency").notNull().default("USD"),
    notes: text("notes"),
    convertedInvoiceId: uuid("converted_invoice_id").references(() => invoices.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("quotes_user_id_quote_number_key").on(table.userId, table.quoteNumber),
    check(
      "quotes_status_check",
      sql`${table.status} in ('draft','sent','accepted','rejected')`
    ),
    check("quotes_currency_check", sql`${table.currency} in ('USD','EUR')`),
  ]
);

export const quoteItems = pgTable("quote_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteId: uuid("quote_id")
    .notNull()
    .references(() => quotes.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: numeric("quantity").notNull().default("1"),
  unitPrice: numeric("unit_price").notNull().default("0"),
  total: numeric("total").notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const downPayments = pgTable(
  "down_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    downPaymentNumber: text("down_payment_number").notNull(),
    clientId: uuid("client_id").references(() => clients.id),
    invoiceId: uuid("invoice_id").references(() => invoices.id),
    status: text("status").notNull().default("draft"),
    issueDate: date("issue_date").notNull(),
    description: text("description").notNull().default(""),
    amount: numeric("amount").notNull().default("0"),
    currency: text("currency").notNull().default("USD"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("down_payments_user_id_number_key").on(table.userId, table.downPaymentNumber),
    check("down_payments_status_check", sql`${table.status} in ('draft','sent','paid')`),
    check("down_payments_currency_check", sql`${table.currency} in ('USD','EUR')`),
  ]
);

export const creditNotes = pgTable(
  "credit_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creditNoteNumber: text("credit_note_number").notNull(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("draft"),
    issueDate: date("issue_date").notNull(),
    amount: numeric("amount").notNull().default("0"),
    reason: text("reason").notNull().default(""),
    currency: text("currency").notNull().default("USD"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("credit_notes_user_id_number_key").on(table.userId, table.creditNoteNumber),
    check("credit_notes_status_check", sql`${table.status} in ('draft','issued')`),
    check("credit_notes_currency_check", sql`${table.currency} in ('USD','EUR')`),
  ]
);

export const settings = pgTable("settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull().default("Ma Société"),
  email: text("email").notNull().default(""),
  phone: text("phone"),
  address: text("address").notNull().default(""),
  taxNumber: text("tax_number"),
  taxRate: numeric("tax_rate").notNull().default("18"),
  mobileMoneyDetails: text("mobile_money_details"),
  logoUrl: text("logo_url"),
  currency: text("currency").notNull().default("USD"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  check("settings_currency_check", sql`${table.currency} in ('USD','EUR')`),
]);

export const pendingPayments = pgTable(
  "pending_payments",
  {
    depositId: text("deposit_id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: text("plan_id").notNull(),
    billingPeriod: text("billing_period").notNull(),
    amountUsd: numeric("amount_usd"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "pending_payments_billing_period_check",
      sql`${table.billingPeriod} in ('monthly','yearly')`
    ),
    check(
      "pending_payments_status_check",
      sql`${table.status} in ('pending','completed','failed')`
    ),
  ]
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: text("plan_id").notNull(),
    billingPeriod: text("billing_period").notNull(),
    status: text("status").notNull().default("active"),
    amountUsd: numeric("amount_usd"),
    depositId: text("deposit_id").unique(),
    provider: text("provider").notNull().default("pawapay"),
    providerSubscriptionId: text("provider_subscription_id").unique(),
    providerCustomerId: text("provider_customer_id"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "subscriptions_billing_period_check",
      sql`${table.billingPeriod} in ('monthly','yearly')`
    ),
    check(
      "subscriptions_status_check",
      sql`${table.status} in ('active','cancelled','expired')`
    ),
    check(
      "subscriptions_provider_check",
      sql`${table.provider} in ('pawapay','stripe','paypal')`
    ),
  ]
);

export const clientsRelations = relations(clients, ({ many }) => ({
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}));

export const refundsRelations = relations(refunds, ({ one }) => ({
  invoice: one(invoices, { fields: [refunds.invoiceId], references: [invoices.id] }),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  client: one(clients, { fields: [quotes.clientId], references: [clients.id] }),
  items: many(quoteItems),
  convertedInvoice: one(invoices, {
    fields: [quotes.convertedInvoiceId],
    references: [invoices.id],
  }),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, { fields: [quoteItems.quoteId], references: [quotes.id] }),
}));

export const downPaymentsRelations = relations(downPayments, ({ one }) => ({
  client: one(clients, { fields: [downPayments.clientId], references: [clients.id] }),
  invoice: one(invoices, { fields: [downPayments.invoiceId], references: [invoices.id] }),
}));

export const creditNotesRelations = relations(creditNotes, ({ one }) => ({
  invoice: one(invoices, { fields: [creditNotes.invoiceId], references: [invoices.id] }),
}));
