import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAWAPAY_BASE = process.env.PAWAPAY_BASE_URL || 'https://api.sandbox.pawapay.cloud';

export async function POST(req: NextRequest) {
  try {
    const { depositId, plan_id, billing_period, user_id, amount } = await req.json();

    if (!depositId || !plan_id || !user_id) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Vérifier le statut du dépôt directement auprès de PawaPay
    const res = await fetch(`${PAWAPAY_BASE}/deposits/${depositId}`, {
      headers: { Authorization: `Bearer ${process.env.PAWAPAY_API_KEY}` },
      cache: 'no-store',
    });

    const data = await res.json();
    const deposit = Array.isArray(data) ? data[0] : data;

    if (deposit?.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: `Paiement non complété (statut: ${deposit?.status ?? 'inconnu'})` },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const expiresAt = new Date();
    if (billing_period === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Annuler les abonnements actifs existants
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', user_id)
      .eq('status', 'active');

    const { error } = await supabaseAdmin.from('subscriptions').insert({
      user_id,
      plan_id,
      billing_period,
      status: 'active',
      amount_usd: deposit.amount ?? amount,
      deposit_id: depositId,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      console.error('[activate] Supabase error:', error);
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PawaPay activate]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
