CREATE TABLE "credit_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credit_note_number" text NOT NULL,
	"invoice_id" uuid NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"issue_date" date NOT NULL,
	"amount" numeric DEFAULT '0' NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid NOT NULL,
	CONSTRAINT "credit_notes_user_id_number_key" UNIQUE("user_id","credit_note_number"),
	CONSTRAINT "credit_notes_status_check" CHECK ("credit_notes"."status" in ('draft','issued')),
	CONSTRAINT "credit_notes_currency_check" CHECK ("credit_notes"."currency" in ('USD','EUR'))
);
--> statement-breakpoint
CREATE TABLE "down_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"down_payment_number" text NOT NULL,
	"client_id" uuid,
	"invoice_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"issue_date" date NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"amount" numeric DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid NOT NULL,
	CONSTRAINT "down_payments_user_id_number_key" UNIQUE("user_id","down_payment_number"),
	CONSTRAINT "down_payments_status_check" CHECK ("down_payments"."status" in ('draft','sent','paid')),
	CONSTRAINT "down_payments_currency_check" CHECK ("down_payments"."currency" in ('USD','EUR'))
);
--> statement-breakpoint
CREATE TABLE "quote_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric DEFAULT '1' NOT NULL,
	"unit_price" numeric DEFAULT '0' NOT NULL,
	"total" numeric DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_number" text NOT NULL,
	"client_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"issue_date" date NOT NULL,
	"valid_until" date NOT NULL,
	"subtotal" numeric DEFAULT '0' NOT NULL,
	"tax_rate" numeric DEFAULT '18' NOT NULL,
	"tax_amount" numeric DEFAULT '0' NOT NULL,
	"total" numeric DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"notes" text,
	"converted_invoice_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid NOT NULL,
	CONSTRAINT "quotes_user_id_quote_number_key" UNIQUE("user_id","quote_number"),
	CONSTRAINT "quotes_status_check" CHECK ("quotes"."status" in ('draft','sent','accepted','rejected')),
	CONSTRAINT "quotes_currency_check" CHECK ("quotes"."currency" in ('USD','EUR'))
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "category" text DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "down_payments" ADD CONSTRAINT "down_payments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "down_payments" ADD CONSTRAINT "down_payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "down_payments" ADD CONSTRAINT "down_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_converted_invoice_id_invoices_id_fk" FOREIGN KEY ("converted_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_category_check" CHECK ("clients"."category" in ('individual','business'));