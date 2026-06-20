import { NextRequest, NextResponse } from 'next/server';

const PAWAPAY_BASE = process.env.PAWAPAY_BASE_URL || 'https://api.sandbox.pawapay.cloud';

export async function GET(
  _req: NextRequest,
  { params }: { params: { depositId: string } }
) {
  try {
    const res = await fetch(`${PAWAPAY_BASE}/deposits/${params.depositId}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAWAPAY_API_KEY}`,
      },
      cache: 'no-store',
    });

    const data = await res.json();
    // PawaPay renvoie un tableau pour les deposits
    const deposit = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      status: deposit?.status ?? 'UNKNOWN',
      amount: deposit?.amount,
    });
  } catch (err) {
    console.error('[PawaPay status]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
