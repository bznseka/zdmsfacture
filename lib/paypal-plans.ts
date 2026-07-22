import type { PlanId, BillingPeriod } from "./plans";

// Rempli une fois par `scripts/setup-paypal-plans.mjs` (Billing Plans PayPal pré-créés,
// PayPal n'accepte pas de prix à la volée comme Stripe).
export const PAYPAL_PLAN_IDS: Record<PlanId, Record<BillingPeriod, string>> = {
  "plan-starter": { monthly: "P-3H1208092F119113VNJQJPLQ", yearly: "P-1DP16450YD447272WNJQJPLQ" },
  "plan-pro": { monthly: "P-6DW45154D7276901TNJQJPLY", yearly: "P-351260429N915610DNJQJPLY" },
  "plan-business": { monthly: "P-8TY09177KU794422NNJQJPMA", yearly: "P-8DH61871W7426745PNJQJPMA" },
};

export function getPaypalPlanId(planId: PlanId, billingPeriod: BillingPeriod): string | null {
  const id = PAYPAL_PLAN_IDS[planId]?.[billingPeriod];
  return id || null;
}
