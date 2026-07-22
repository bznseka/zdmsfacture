import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { paypalFetch, verifyPaypalWebhookSignature } from "@/lib/paypal";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";

export async function POST(request: Request) {
  const rawBody = await request.text();

  const valid = await verifyPaypalWebhookSignature(request.headers, rawBody).catch(() => false);
  if (!valid) {
    console.error("[PayPal webhook] signature invalide");
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  try {
    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const resource = event.resource;
        const subscriptionID = resource.id as string;
        const [ownerId, planId, billingPeriod] = String(resource.custom_id || "").split("|");
        if (!ownerId || !planId || !billingPeriod) break;

        const [existing] = await db
          .select({ id: subscriptions.id })
          .from(subscriptions)
          .where(eq(subscriptions.providerSubscriptionId, subscriptionID))
          .limit(1);
        if (existing) break; // déjà activé via /confirm

        await db
          .update(subscriptions)
          .set({ status: "cancelled" })
          .where(and(eq(subscriptions.userId, ownerId), eq(subscriptions.status, "active")));

        const expiresAt = resource.billing_info?.next_billing_time
          ? new Date(resource.billing_info.next_billing_time)
          : (() => {
              const d = new Date();
              if (billingPeriod === "yearly") {
                d.setFullYear(d.getFullYear() + 1);
              } else {
                d.setMonth(d.getMonth() + 1);
              }
              return d;
            })();

        await db.insert(subscriptions).values({
          userId: ownerId,
          planId,
          billingPeriod,
          status: "active",
          provider: "paypal",
          providerSubscriptionId: subscriptionID,
          expiresAt,
        });
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        const subscriptionID = event.resource.billing_agreement_id as string | undefined;
        if (!subscriptionID) break;

        const detailRes = await paypalFetch(`/v1/billing/subscriptions/${subscriptionID}`);
        if (!detailRes.ok) break;
        const detail = await detailRes.json();
        const nextBilling = detail.billing_info?.next_billing_time;
        if (!nextBilling) break;

        await db
          .update(subscriptions)
          .set({ expiresAt: new Date(nextBilling), status: "active" })
          .where(eq(subscriptions.providerSubscriptionId, subscriptionID));
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const subscriptionID = event.resource.id as string;
        await db
          .update(subscriptions)
          .set({ status: "cancelled" })
          .where(eq(subscriptions.providerSubscriptionId, subscriptionID));
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[PayPal webhook] erreur de traitement:", err);
    return NextResponse.json({ received: true });
  }
}
