import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { downPayments, clients, invoices } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapeDownPayment } from "@/lib/shape";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();

    const updates: Partial<typeof downPayments.$inferInsert> = {};
    if (body.clientId !== undefined) updates.clientId = body.clientId;
    if (body.invoiceId !== undefined) updates.invoiceId = body.invoiceId;
    if (body.status !== undefined) updates.status = body.status;
    if (body.issueDate !== undefined) updates.issueDate = body.issueDate;
    if (body.description !== undefined) updates.description = body.description;
    if (body.amount !== undefined) updates.amount = String(body.amount);
    if (body.notes !== undefined) updates.notes = body.notes;

    const [row] = await db
      .update(downPayments)
      .set(updates)
      .where(and(eq(downPayments.id, id), eq(downPayments.userId, userId)))
      .returning();

    if (!row) {
      return NextResponse.json({ error: "Acompte introuvable" }, { status: 404 });
    }

    const [client, invoice] = await Promise.all([
      row.clientId ? db.query.clients.findFirst({ where: eq(clients.id, row.clientId) }) : null,
      row.invoiceId ? db.query.invoices.findFirst({ where: eq(invoices.id, row.invoiceId) }) : null,
    ]);

    return NextResponse.json(shapeDownPayment(row, client, invoice?.invoiceNumber));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const deleted = await db
      .delete(downPayments)
      .where(and(eq(downPayments.id, id), eq(downPayments.userId, userId)))
      .returning({ id: downPayments.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Acompte introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
