import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sendPasswordResetEmail } from "@/lib/resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const GENERIC_MESSAGE = "Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email as string | undefined)?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email requis." }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user) {
      const resetToken = randomBytes(32).toString("hex");
      const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.update(users).set({ resetToken, resetTokenExpiresAt }).where(eq(users.id, user.id));

      const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (err) {
        console.error("[forgot-password] envoi email échoué:", err);
      }
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }
}
