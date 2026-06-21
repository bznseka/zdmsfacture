import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // PawaPay envoie parfois un tableau, parfois un objet unique
    const deposit = Array.isArray(body) ? body[0] : body;

    if (!deposit?.depositId || deposit.status !== 'COMPLETED') {
      return NextResponse.json({ received: true });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Récupérer les métadonnées du paiement
    const { data: pending } = await supabaseAdmin
      .from('pending_payments')
      .select('*')
      .eq('deposit_id', deposit.depositId)
      .eq('status', 'pending')
      .single();

    if (!pending) {
      return NextResponse.json({ received: true });
    }

    // Vérifier que l'abonnement n'a pas déjà été activé (idempotence)
    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('deposit_id', deposit.depositId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ received: true });
    }

    const expiresAt = new Date();
    if (pending.billing_period === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Annuler les abonnements actifs existants
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', pending.user_id)
      .eq('status', 'active');

    // Créer le nouvel abonnement
    await supabaseAdmin.from('subscriptions').insert({
      user_id: pending.user_id,
      plan_id: pending.plan_id,
      billing_period: pending.billing_period,
      status: 'active',
      amount_usd: deposit.depositedAmount ?? pending.amount_usd,
      deposit_id: deposit.depositId,
      expires_at: expiresAt.toISOString(),
    });

    // Marquer le paiement comme traité
    await supabaseAdmin
      .from('pending_payments')
      .update({ status: 'completed' })
      .eq('deposit_id', deposit.depositId);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[PawaPay webhook]', err);
    // Toujours répondre 200 pour éviter que PawaPay ne relance indéfiniment
    return NextResponse.json({ received: true });
  }
}
