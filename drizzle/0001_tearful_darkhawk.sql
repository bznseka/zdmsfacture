ALTER TABLE "clients" ALTER COLUMN "country" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "total_cdf";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "exchange_rate";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "amount_cdf";--> statement-breakpoint
ALTER TABLE "refunds" DROP COLUMN "amount_cdf";--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "exchange_rate";