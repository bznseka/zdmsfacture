import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';

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

    const expiresAt = new Date();
    if (billing_period === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    try {
      // Annuler les abonnements actifs existants
      await db
        .update(subscriptions)
        .set({ status: 'cancelled' })
        .where(and(eq(subscriptions.userId, user_id), eq(subscriptions.status, 'active')));

      await db.insert(subscriptions).values({
        userId: user_id,
        planId: plan_id,
        billingPeriod: billing_period,
        status: 'active',
        amountUsd: String(deposit.amount ?? amount),
        depositId,
        expiresAt,
      });
    } catch (dbErr) {
      console.error('[activate] DB error:', dbErr);
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PawaPay activate]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
