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

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  country: text("country").default("CD"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

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
    totalCdf: numeric("total_cdf").notNull().default("0"),
    exchangeRate: numeric("exchange_rate").notNull().default("2800"),
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
    amountCdf: numeric("amount_cdf").notNull(),
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
    amountCdf: numeric("amount_cdf").notNull(),
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

export const settings = pgTable("settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull().default("Ma Société"),
  email: text("email").notNull().default(""),
  phone: text("phone"),
  address: text("address").notNull().default(""),
  taxNumber: text("tax_number"),
  currency: text("currency").notNull().default("USD"),
  taxRate: numeric("tax_rate").notNull().default("18"),
  exchangeRate: numeric("exchange_rate").notNull().default("2800"),
  mobileMoneyDetails: text("mobile_money_details"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

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
