import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { isValidPlan, getPlanAmountUsd, PLANS, type BillingPeriod } from "@/lib/plans";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const planId = body.planId as string | undefined;
    const billingPeriod = body.billingPeriod as BillingPeriod | undefined;

    if (!planId || !isValidPlan(planId) || (billingPeriod !== "monthly" && billingPeriod !== "yearly")) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const amountUsd = getPlanAmountUsd(planId, billingPeriod);
    const plan = PLANS[planId];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amountUsd * 100),
            recurring: { interval: billingPeriod === "yearly" ? "year" : "month" },
            product_data: {
              name: `zdmsFacture — Forfait ${plan.name} (${billingPeriod === "yearly" ? "annuel" : "mensuel"})`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { userId, planId, billingPeriod },
      subscription_data: {
        metadata: { userId, planId, billingPeriod },
      },
      success_url: `${APP_URL}/subscriptions?stripe=success`,
      cancel_url: `${APP_URL}/subscriptions?stripe=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
