import { NextResponse } from "next/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { requireAdmin, apiErrorResponse } from "@/lib/auth-guard";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const [row] = await db
      .select({
        planId: subscriptions.planId,
        billingPeriod: subscriptions.billingPeriod,
        status: subscriptions.status,
        expiresAt: subscriptions.expiresAt,
      })
      .from(subscriptions)
      .where(
        and(eq(subscriptions.userId, id), eq(subscriptions.status, "active"), gte(subscriptions.expiresAt, new Date()))
      )
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    return NextResponse.json(row || null);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    if (body.action === "cancel") {
      await db
        .update(subscriptions)
        .set({ status: "cancelled" })
        .where(and(eq(subscriptions.userId, id), eq(subscriptions.status, "active")));

      return NextResponse.json({ success: true });
    }

    if (body.action === "activate") {
      const planId = body.planId as string | undefined;
      const billingPeriod = body.billingPeriod as "monthly" | "yearly" | undefined;

      if (!planId || (billingPeriod !== "monthly" && billingPeriod !== "yearly")) {
        return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
      }

      const expiresAt = new Date();
      if (billingPeriod === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      await db
        .update(subscriptions)
        .set({ status: "cancelled" })
        .where(and(eq(subscriptions.userId, id), eq(subscriptions.status, "active")));

      const [row] = await db
        .insert(subscriptions)
        .values({
          userId: id,
          planId,
          billingPeriod,
          status: "active",
          expiresAt,
        })
        .returning();

      return NextResponse.json(row, { status: 201 });
    }

    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
