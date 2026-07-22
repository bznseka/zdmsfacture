import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/db";
import { users, settings, subscriptions } from "@/db/schema";
import { requireAdmin, apiErrorResponse } from "@/lib/auth-guard";

export async function GET() {
  try {
    await requireAdmin();

    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    const userIds = allUsers.map((u) => u.id);
    const activeSubs = userIds.length
      ? await db
          .select({
            userId: subscriptions.userId,
            planId: subscriptions.planId,
            billingPeriod: subscriptions.billingPeriod,
            expiresAt: subscriptions.expiresAt,
          })
          .from(subscriptions)
          .where(
            and(
              inArray(subscriptions.userId, userIds),
              eq(subscriptions.status, "active"),
              gte(subscriptions.expiresAt, new Date())
            )
          )
      : [];

    const subsByUser = new Map(activeSubs.map((s) => [s.userId, s]));

    return NextResponse.json(
      allUsers.map((u) => ({ ...u, subscription: subsByUser.get(u.id) || null }))
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const email = (body.email as string | undefined)?.trim().toLowerCase();
    const password = body.password as string | undefined;
    const role = body.role === "admin" ? "admin" : "user";

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères." },
        { status: 400 }
      );
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return NextResponse.json(
        { error: "Cette adresse e-mail est déjà utilisée." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({ email, passwordHash, role })
      .returning({ id: users.id, email: users.email, role: users.role, status: users.status, createdAt: users.createdAt });

    await db.insert(settings).values({ userId: user.id, email: user.email });

    return NextResponse.json({ ...user, subscription: null }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
