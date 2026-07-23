ALTER TABLE "invoices" ADD COLUMN "currency" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "currency" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_currency_check" CHECK ("invoices"."currency" in ('USD','EUR'));--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_currency_check" CHECK ("settings"."currency" in ('USD','EUR'));