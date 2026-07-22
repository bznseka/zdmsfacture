export type PlanId = "plan-starter" | "plan-pro" | "plan-business";
export type BillingPeriod = "monthly" | "yearly";

interface PlanDefinition {
  name: string;
  priceMonthly: number;
  priceYearly: number;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  "plan-starter": { name: "Starter", priceMonthly: 15, priceYearly: 12 },
  "plan-pro": { name: "Pro", priceMonthly: 35, priceYearly: 28 },
  "plan-business": { name: "Business", priceMonthly: 79, priceYearly: 63 },
};

export function isValidPlan(planId: string): planId is PlanId {
  return planId in PLANS;
}

export function getPlanAmountUsd(planId: PlanId, billingPeriod: BillingPeriod): number {
  const plan = PLANS[planId];
  return billingPeriod === "yearly" ? plan.priceYearly * 12 : plan.priceMonthly;
}
