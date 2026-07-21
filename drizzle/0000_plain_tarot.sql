CREATE EXTENSION IF NOT EXISTS pgcrypto;
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"country" text DEFAULT 'CD',
	"created_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric DEFAULT '1' NOT NULL,
	"unit_price" numeric DEFAULT '0' NOT NULL,
	"total" numeric DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"client_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"subtotal" numeric DEFAULT '0' NOT NULL,
	"tax_rate" numeric DEFAULT '18' NOT NULL,
	"tax_amount" numeric DEFAULT '0' NOT NULL,
	"total_usd" numeric DEFAULT '0' NOT NULL,
	"total_cdf" numeric DEFAULT '0' NOT NULL,
	"exchange_rate" numeric DEFAULT '2800' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid NOT NULL,
	CONSTRAINT "invoices_user_id_invoice_number_key" UNIQUE("user_id","invoice_number"),
	CONSTRAINT "invoices_status_check" CHECK ("invoices"."status" in ('draft','sent','paid','overdue'))
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount_usd" numeric NOT NULL,
	"amount_cdf" numeric NOT NULL,
	"method" text NOT NULL,
	"reference" text,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid NOT NULL,
	CONSTRAINT "payments_method_check" CHECK ("payments"."method" in ('cash','mobile_money','bank'))
);
--> statement-breakpoint
CREATE TABLE "pending_payments" (
	"deposit_id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" text NOT NULL,
	"billing_period" text NOT NULL,
	"amount_usd" numeric,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "pending_payments_billing_period_check" CHECK ("pending_payments"."billing_period" in ('monthly','yearly')),
	CONSTRAINT "pending_payments_status_check" CHECK ("pending_payments"."status" in ('pending','completed','failed'))
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount_usd" numeric NOT NULL,
	"amount_cdf" numeric NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reason" text NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid NOT NULL,
	CONSTRAINT "refunds_status_check" CHECK ("refunds"."status" in ('pending','approved','rejected'))
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"company_name" text DEFAULT 'Ma Société' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text,
	"address" text DEFAULT '' NOT NULL,
	"tax_number" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"tax_rate" numeric DEFAULT '18' NOT NULL,
	"exchange_rate" numeric DEFAULT '2800' NOT NULL,
	"mobile_money_details" text,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" text NOT NULL,
	"billing_period" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"amount_usd" numeric,
	"deposit_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "subscriptions_deposit_id_unique" UNIQUE("deposit_id"),
	CONSTRAINT "subscriptions_billing_period_check" CHECK ("subscriptions"."billing_period" in ('monthly','yearly')),
	CONSTRAINT "subscriptions_status_check" CHECK ("subscriptions"."status" in ('active','cancelled','expired'))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_payments" ADD CONSTRAINT "pending_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;