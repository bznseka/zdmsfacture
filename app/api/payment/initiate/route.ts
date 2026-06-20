import { NextRequest, NextResponse } from 'next/server';

const PAWAPAY_BASE = process.env.PAWAPAY_BASE_URL || 'https://api.sandbox.pawapay.cloud';

// Codes correspondants PawaPay pour la RDC — vérifiez dans votre tableau de bord PawaPay
const CORRESPONDENT: Record<string, string> = {
  airtel: 'AIRTEL_MONEY_CDG',
  orange: 'ORANGE_MONEY_CDG',
};

function toMsisdn(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('243')) return digits;
  if (digits.startsWith('0')) return '243' + digits.slice(1);
  return '243' + digits;
}

export async function POST(req: NextRequest) {
  try {
    const { phone, network, amount, plan_id, billing_period } = await req.json();

    const correspondent = CORRESPONDENT[network];
    if (!correspondent) {
      return NextResponse.json({ error: 'Réseau non supporté' }, { status: 400 });
    }

    if (!phone || !amount || !plan_id) {
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
      const msg = data.rejectionReason?.rejectionMessage || 'Paiement rejeté par l\'opérateur';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ depositId, status: data.status ?? 'ACCEPTED' });
  } catch (err) {
    console.error('[PawaPay initiate]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
