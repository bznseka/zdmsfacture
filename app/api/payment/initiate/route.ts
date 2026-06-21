import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAWAPAY_BASE = process.env.PAWAPAY_BASE_URL || 'https://api.sandbox.pawapay.cloud';

const CORRESPONDENT: Record<string, string> = {
  airtel: 'AIRTEL_COD',
  orange: 'ORANGE_COD',
  vodacom: 'VODACOM_MPESA_COD',
};

function toMsisdn(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('243')) return digits;
  if (digits.startsWith('0')) return '243' + digits.slice(1);
  return '243' + digits;
}

export async function POST(req: NextRequest) {
  try {
    const { phone, network, amount, plan_id, billing_period, user_id } = await req.json();

    const correspondent = CORRESPONDENT[network];
    if (!correspondent) {
      return NextResponse.json({ error: 'Réseau non supporté' }, { status: 400 });
    }

    if (!phone || !amount || !plan_id || !user_id) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const depositId = crypto.randomUUID();
    const msisdn = toMsisdn(phone);
    const planLabel = plan_id.replace('plan-', '').toUpperCase();
    const periodLabel = billing_period === 'yearly' ? 'ANNUEL' : 'MENSUEL';

    const res = await fetch(`${PAWAPAY_BASE}/deposits`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAWAPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        depositId,
        amount: Number(amount).toFixed(2),
        currency: 'USD',
        correspondent,
        payer: {
          type: 'MSISDN',
          address: { value: msisdn },
        },
        customerTimestamp: new Date().toISOString(),
        statementDescription: `ZDMS ${planLabel} ${periodLabel}`,
      }),
    });

    const data = await res.json();

    if (data.status === 'REJECTED') {
      const msg = data.rejectionReason?.rejectionMessage || "Paiement rejeté par l'opérateur";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Sauvegarder les métadonnées pour le webhook et l'activation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabaseAdmin.from('pending_payments').insert({
      deposit_id: depositId,
      user_id,
      plan_id,
      billing_period,
      amount_usd: Number(amount),
    });

    return NextResponse.json({ depositId, status: data.status ?? 'ACCEPTED' });
  } catch (err) {
    console.error('[PawaPay initiate]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
