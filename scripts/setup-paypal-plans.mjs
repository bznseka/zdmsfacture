// Script ponctuel : crée un Produit PayPal + 6 Billing Plans (3 forfaits x 2 périodicités).
// Usage: node scripts/setup-paypal-plans.mjs
// Nécessite PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_BASE_URL dans .env.local

import { readFileSync } from "fs";

function loadEnvLocal() {
  try {
    const content = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) process.env[match[1]] = match[2].replace(/^"|"$/g, "");
    }
  } catch {
    // ignore, rely on already-exported env vars
  }
}
loadEnvLocal();

const BASE = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

const PLANS = [
  { id: "plan-starter", name: "Starter", priceMonthly: 15, priceYearly: 12 },
  { id: "plan-pro", name: "Pro", priceMonthly: 35, priceYearly: 28 },
  { id: "plan-business", name: "Business", priceMonthly: 79, priceYearly: 63 },
];

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Auth PayPal échouée: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

async function paypalPost(token, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} a échoué: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET manquants (.env.local).");
    process.exit(1);
  }

  const token = await getAccessToken();
  console.log("Connecté à PayPal:", BASE);

  const product = await paypalPost(token, "/v1/catalogs/products", {
    name: "zdmsFacture",
    description: "Abonnement zdmsFacture — facturation SaaS",
    type: "SERVICE",
    category: "SOFTWARE",
  });
  console.log("Produit créé:", product.id);

  const result = {};
  for (const plan of PLANS) {
    result[plan.id] = {};
    for (const [period, price, interval] of [
      ["monthly", plan.priceMonthly, "MONTH"],
      ["yearly", plan.priceYearly * 12, "YEAR"],
    ]) {
      const billingPlan = await paypalPost(token, "/v1/billing/plans", {
        product_id: product.id,
        name: `zdmsFacture ${plan.name} (${period})`,
        billing_cycles: [
          {
            frequency: { interval_unit: interval, interval_count: 1 },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: { fixed_price: { value: String(price), currency_code: "USD" } },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          payment_failure_threshold: 2,
        },
      });
      result[plan.id][period] = billingPlan.id;
      console.log(`  ${plan.id} / ${period} -> ${billingPlan.id}`);
    }
  }

  console.log("\nColle ceci dans lib/paypal-plans.ts (objet PAYPAL_PLAN_IDS):\n");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
