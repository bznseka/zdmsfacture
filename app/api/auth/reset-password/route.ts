import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq, and, gte } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token as string | undefined;
    const password = body.password as string | undefined;

    if (!token || !password) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères." },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.resetToken, token), gte(users.resetTokenExpiresAt, new Date())))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Ce lien de réinitialisation est invalide ou a expiré." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db
      .update(users)
      .set({ passwordHash, resetToken: null, resetTokenExpiresAt: null })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
