import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { invoices, users } from "@/db/schema";

export class UnauthorizedError extends Error {
  constructor(message = "Non authentifié") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Accès refusé") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  const [row] = await db
    .select({ status: users.status })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!row || row.status === "suspended") {
    throw new ForbiddenError("Ce compte a été suspendu.");
  }

  return session.user.id;
}

export async function requireAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  if (session.user.role !== "admin") {
    throw new ForbiddenError();
  }
  return session.user.id;
}

export async function assertInvoiceOwnership(invoiceId: string, userId: string): Promise<void> {
  const [invoice] = await db
    .select({ userId: invoices.userId })
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (!invoice || invoice.userId !== userId) {
    throw new ForbiddenError();
  }
}

export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  console.error(error);
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}
