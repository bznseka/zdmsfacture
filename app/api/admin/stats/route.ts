import { NextResponse } from "next/server";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { users, subscriptions, invoices } from "@/db/schema";
import { requireAdmin, apiErrorResponse } from "@/lib/auth-guard";

export async function GET() {
  try {
    await requireAdmin();

    const [userRows, activeSubs, paidInvoices] = await Promise.all([
      db.select({ id: users.id, status: users.status, createdAt: users.createdAt }).from(users),
      db
        .select({ planId: subscriptions.planId })
        .from(subscriptions)
        .where(and(eq(subscriptions.status, "active"), gte(subscriptions.expiresAt, new Date()))),
      db
        .select({ totalUsd: invoices.totalUsd })
        .from(invoices)
        .where(eq(invoices.status, "paid")),
    ]);

    const totalUsers = userRows.length;
    const activeUsers = userRows.filter((u) => u.status === "active").length;
    const suspendedUsers = userRows.filter((u) => u.status === "suspended").length;
    const totalRevenueUsd = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalUsd), 0);

    const planCounts: Record<string, number> = {};
    for (const sub of activeSubs) {
      planCounts[sub.planId] = (planCounts[sub.planId] || 0) + 1;
    }

    const now = new Date();
    const months: { key: string; label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("fr-FR", { month: "short" }),
        count: 0,
      });
    }
    const monthIndex = new Map(months.map((m) => [m.key, m]));
    for (const u of userRows) {
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = monthIndex.get(key);
      if (bucket) bucket.count += 1;
    }

    return NextResponse.json({
      totalUsers,
      activeUsers,
      suspendedUsers,
      activeSubscriptionsCount: activeSubs.length,
      totalRevenueUsd,
      planDistribution: planCounts,
      signupsByMonth: months.map(({ label, count }) => ({ month: label, count })),
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
