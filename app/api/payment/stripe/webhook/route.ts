import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";

async function activateSubscription({
  userId,
  planId,
  billingPeriod,
  stripeSubscriptionId,
  stripeCustomerId,
  expiresAt,
  amountUsd,
}: {
  userId: string;
  planId: string;
  billingPeriod: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  expiresAt: Date;
  amountUsd: number;
}) {
  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.providerSubscriptionId, stripeSubscriptionId))
    .limit(1);
  if (existing) return; // idempotent

  await db
    .update(subscriptions)
    .set({ status: "cancelled" })
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")));

  await db.insert(subscriptions).values({
    userId,
    planId,
    billingPeriod,
    status: "active",
    amountUsd: String(amountUsd),
    provider: "stripe",
    providerSubscriptionId: stripeSubscriptionId,
    providerCustomerId: stripeCustomerId,
    expiresAt,
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[Stripe webhook] signature invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, planId, billingPeriod } = session.metadata || {};
        if (!userId || !planId || !billingPeriod || !session.subscription || !session.customer) break;

        const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string);
        const expiresAt = new Date(stripeSub.items.data[0].current_period_end * 1000);

        await activateSubscription({
          userId,
          planId,
          billingPeriod,
          stripeSubscriptionId: stripeSub.id,
          stripeCustomerId: session.customer as string,
          expiresAt,
          amountUsd: (session.amount_total ?? 0) / 100,
        });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as unknown as { subscription?: string }).subscription;
        if (!subId) break;

        const stripeSub = await stripe.subscriptions.retrieve(subId);
        const expiresAt = new Date(stripeSub.items.data[0].current_period_end * 1000);

        await db
          .update(subscriptions)
          .set({ expiresAt, status: "active" })
          .where(eq(subscriptions.providerSubscriptionId, subId));
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        await db
          .update(subscriptions)
          .set({ status: "cancelled" })
          .where(eq(subscriptions.providerSubscriptionId, stripeSub.id));
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe webhook] erreur de traitement:", err);
    return NextResponse.json({ received: true });
  }
}
