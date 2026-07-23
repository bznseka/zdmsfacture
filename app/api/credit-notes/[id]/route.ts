import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { creditNotes } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapeCreditNote } from "@/lib/shape";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();

    const updates: Partial<typeof creditNotes.$inferInsert> = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.reason !== undefined) updates.reason = body.reason;
    if (body.amount !== undefined) updates.amount = String(body.amount);

    const row = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(creditNotes)
        .set(updates)
        .where(and(eq(creditNotes.id, id), eq(creditNotes.userId, userId)))
        .returning();
      return updated;
    });

    if (!row) {
      return NextResponse.json({ error: "Avoir introuvable" }, { status: 404 });
    }

    const withInvoice = await db.query.creditNotes.findFirst({
      where: eq(creditNotes.id, id),
      with: { invoice: { with: { client: true } } },
    });

    return NextResponse.json(
      shapeCreditNote(row, withInvoice?.invoice?.invoiceNumber, withInvoice?.invoice?.client?.name)
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const deleted = await db
      .delete(creditNotes)
      .where(and(eq(creditNotes.id, id), eq(creditNotes.userId, userId)))
      .returning({ id: creditNotes.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Avoir introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
