import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { stripe } from "@/lib/stripe";
import { paypalFetch } from "@/lib/paypal";

export async function POST() {
  try {
    const userId = await requireUserId();

    const [active] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (!active) {
      return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 404 });
    }

    if (active.provider === "stripe" && active.providerSubscriptionId) {
      // Laisse l'accès jusqu'à la fin de la période déjà payée ; le webhook
      // `customer.subscription.deleted` marquera la ligne "cancelled" à ce moment-là.
      await stripe.subscriptions.update(active.providerSubscriptionId, { cancel_at_period_end: true });
      return NextResponse.json({ success: true, effectiveAt: active.expiresAt });
    }

    if (active.provider === "paypal" && active.providerSubscriptionId) {
      const res = await paypalFetch(`/v1/billing/subscriptions/${active.providerSubscriptionId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: "Annulation demandée par le client" }),
      });
      if (!res.ok && res.status !== 422) {
        // 422 = déjà annulé côté PayPal, on peut continuer à marquer notre ligne
        console.error("[PayPal cancel]", await res.text());
        return NextResponse.json({ error: "Erreur lors de l'annulation PayPal" }, { status: 502 });
      }
    }

    // PayPal (annulation immédiate côté fournisseur) et pawapay (jamais reconduit
    // automatiquement) : on marque la ligne annulée tout de suite.
    await db.update(subscriptions).set({ status: "cancelled" }).where(eq(subscriptions.id, active.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
