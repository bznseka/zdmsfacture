import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const { status } = await request.json();

    const [row] = await db
      .update(invoices)
      .set({ status })
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .returning({ id: invoices.id, status: invoices.status });

    if (!row) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
