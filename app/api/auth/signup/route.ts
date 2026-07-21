import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, settings } from "@/db/schema";

export async function POST(request: Request) {
  const body = await request.json();
  const email = (body.email as string | undefined)?.trim().toLowerCase();
  const password = body.password as string | undefined;

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
    .values({ email, passwordHash })
    .returning({ id: users.id, email: users.email });

  await db.insert(settings).values({
    userId: user.id,
    email: user.email,
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
