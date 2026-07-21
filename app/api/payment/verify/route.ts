import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { pendingPayments, subscriptions } from '@/db/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // PawaPay envoie parfois un tableau, parfois un objet unique
    const deposit = Array.isArray(body) ? body[0] : body;

    if (!deposit?.depositId || deposit.status !== 'COMPLETED') {
      return NextResponse.json({ received: true });
    }

    // Récupérer les métadonnées du paiement
    const [pending] = await db
      .select()
      .from(pendingPayments)
      .where(
        and(eq(pendingPayments.depositId, deposit.depositId), eq(pendingPayments.status, 'pending'))
      )
      .limit(1);

    if (!pending) {
      return NextResponse.json({ received: true });
    }

    // Vérifier que l'abonnement n'a pas déjà été activé (idempotence)
    const [existing] = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.depositId, deposit.depositId))
      .limit(1);

    if (existing) {
      return NextResponse.json({ received: true });
    }

    const expiresAt = new Date();
    if (pending.billingPeriod === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Annuler les abonnements actifs existants
    await db
      .update(subscriptions)
      .set({ status: 'cancelled' })
      .where(and(eq(subscriptions.userId, pending.userId), eq(subscriptions.status, 'active')));

    // Créer le nouvel abonnement
    await db.insert(subscriptions).values({
      userId: pending.userId,
      planId: pending.planId,
      billingPeriod: pending.billingPeriod,
      status: 'active',
      amountUsd: String(deposit.depositedAmount ?? pending.amountUsd),
      depositId: deposit.depositId,
      expiresAt,
    });

    // Marquer le paiement comme traité
    await db
      .update(pendingPayments)
      .set({ status: 'completed' })
      .where(eq(pendingPayments.depositId, deposit.depositId));

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[PawaPay webhook]', err);
    // Toujours répondre 200 pour éviter que PawaPay ne relance indéfiniment
    return NextResponse.json({ received: true });
  }
}
