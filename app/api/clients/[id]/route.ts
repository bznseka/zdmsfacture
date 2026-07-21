import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapeClient } from "@/lib/shape";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();

    const [row] = await db
      .update(clients)
      .set({
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        country: body.country,
      })
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();

    if (!row) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }

    return NextResponse.json(shapeClient(row));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const deleted = await db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning({ id: clients.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
