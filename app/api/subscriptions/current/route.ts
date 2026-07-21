import { NextResponse } from "next/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";

export async function GET() {
  try {
    const userId = await requireUserId();

    const [row] = await db
      .select({
        planId: subscriptions.planId,
        billingPeriod: subscriptions.billingPeriod,
        expiresAt: subscriptions.expiresAt,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active"),
          gte(subscriptions.expiresAt, new Date())
        )
      )
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    return NextResponse.json(row || null);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
