import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq, ne, and } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin, apiErrorResponse } from "@/lib/auth-guard";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const updates: Partial<typeof users.$inferInsert> = {};

    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, email), ne(users.id, id)))
        .limit(1);
      if (existing) {
        return NextResponse.json(
          { error: "Cette adresse e-mail est déjà utilisée." },
          { status: 409 }
        );
      }
      updates.email = email;
    }

    if (body.role !== undefined) {
      if (body.role !== "user" && body.role !== "admin") {
        return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
      }
      updates.role = body.role;
    }

    if (body.status !== undefined) {
      if (body.status !== "active" && body.status !== "suspended") {
        return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.password) {
      if (String(body.password).length < 6) {
        return NextResponse.json(
          { error: "Le mot de passe doit contenir au moins 6 caractères." },
          { status: 400 }
        );
      }
      updates.passwordHash = await bcrypt.hash(String(body.password), 10);
    }

    const [row] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({ id: users.id, email: users.email, role: users.role, status: users.status, createdAt: users.createdAt });

    if (!row) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdmin();
    const { id } = await params;

    if (id === adminId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte." },
        { status: 400 }
      );
    }

    const deleted = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
