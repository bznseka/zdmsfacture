import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { paypalFetch } from "@/lib/paypal";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const subscriptionID = body.subscriptionID as string | undefined;
    if (!subscriptionID) {
      return NextResponse.json({ error: "subscriptionID manquant" }, { status: 400 });
    }

    const res = await paypalFetch(`/v1/billing/subscriptions/${subscriptionID}`);
    if (!res.ok) {
      return NextResponse.json({ error: "Abonnement PayPal introuvable" }, { status: 404 });
    }
    const paypalSub = await res.json();

    const [ownerId, planId, billingPeriod] = String(paypalSub.custom_id || "").split("|");
    if (ownerId !== userId) {
      return NextResponse.json({ error: "Abonnement non associé à cet utilisateur" }, { status: 403 });
    }
    if (paypalSub.status !== "ACTIVE") {
      return NextResponse.json({ error: `Statut PayPal: ${paypalSub.status}` }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.providerSubscriptionId, subscriptionID))
      .limit(1);

    if (!existing) {
      await db
        .update(subscriptions)
        .set({ status: "cancelled" })
        .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")));

      const expiresAt = paypalSub.billing_info?.next_billing_time
        ? new Date(paypalSub.billing_info.next_billing_time)
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
        userId,
        planId,
        billingPeriod,
        status: "active",
        amountUsd: paypalSub.billing_info?.last_payment?.amount?.value ?? null,
        provider: "paypal",
        providerSubscriptionId: subscriptionID,
        expiresAt,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
