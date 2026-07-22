ALTER TABLE "subscriptions" ADD COLUMN "provider" text DEFAULT 'pawapay' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "provider_subscription_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "provider_customer_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_provider_subscription_id_unique" UNIQUE("provider_subscription_id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_provider_check" CHECK ("subscriptions"."provider" in ('pawapay','stripe','paypal'));