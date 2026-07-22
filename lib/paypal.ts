const PAYPAL_BASE = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getPaypalAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Échec de l'authentification PayPal (${res.status})`);
  }

  const data = await res.json();
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.value;
}

export async function paypalFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getPaypalAccessToken();
  return fetch(`${PAYPAL_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

export async function verifyPaypalWebhookSignature(
  headers: Headers,
  rawBody: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  const res = await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_time: headers.get("paypal-transmission-time"),
      cert_url: headers.get("paypal-cert-url"),
      auth_algo: headers.get("paypal-auth-algo"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.verification_status === "SUCCESS";
}

export { PAYPAL_BASE };
