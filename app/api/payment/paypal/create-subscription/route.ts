import { NextResponse } from "next/server";
import { paypalFetch } from "@/lib/paypal";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { isValidPlan, type BillingPeriod } from "@/lib/plans";
import { getPaypalPlanId } from "@/lib/paypal-plans";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const planId = body.planId as string | undefined;
    const billingPeriod = body.billingPeriod as BillingPeriod | undefined;

    if (!planId || !isValidPlan(planId) || (billingPeriod !== "monthly" && billingPeriod !== "yearly")) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const paypalPlanId = getPaypalPlanId(planId, billingPeriod);
    if (!paypalPlanId) {
      return NextResponse.json({ error: "PayPal n'est pas encore configuré pour ce forfait." }, { status: 503 });
    }

    const res = await paypalFetch("/v1/billing/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        plan_id: paypalPlanId,
        custom_id: `${userId}|${planId}|${billingPeriod}`,
        application_context: {
          brand_name: "zdmsFacture",
          user_action: "SUBSCRIBE_NOW",
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[PayPal create-subscription]", errBody);
      return NextResponse.json({ error: "Erreur lors de la création de l'abonnement PayPal" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ subscriptionID: data.id });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
