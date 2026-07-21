import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices, invoiceItems, clients } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapeInvoice } from "@/lib/shape";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();
    const items:
      | Array<{ description: string; quantity: number; unitPrice: number; total: number }>
      | undefined = body.items;

    const result = await db.transaction(async (tx) => {
      const updates: Partial<typeof invoices.$inferInsert> = {};
      if (body.clientId !== undefined) updates.clientId = body.clientId;
      if (body.status !== undefined) updates.status = body.status;
      if (body.issueDate !== undefined) updates.issueDate = body.issueDate;
      if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
      if (body.subtotal !== undefined) updates.subtotal = String(body.subtotal);
      if (body.taxRate !== undefined) updates.taxRate = String(body.taxRate);
      if (body.taxAmount !== undefined) updates.taxAmount = String(body.taxAmount);
      if (body.totalUsd !== undefined) updates.totalUsd = String(body.totalUsd);
      if (body.totalCdf !== undefined) updates.totalCdf = String(body.totalCdf);
      if (body.notes !== undefined) updates.notes = body.notes;

      const [invoice] = await tx
        .update(invoices)
        .set(updates)
        .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
        .returning();

      if (!invoice) return null;

      let finalItems: (typeof invoiceItems.$inferSelect)[];
      if (items) {
        await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
        finalItems =
          items.length > 0
            ? await tx
                .insert(invoiceItems)
                .values(
                  items.map((item) => ({
                    invoiceId: id,
                    description: item.description,
                    quantity: String(item.quantity),
                    unitPrice: String(item.unitPrice),
                    total: String(item.total),
                  }))
                )
                .returning()
            : [];
      } else {
        finalItems = await tx.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
      }

      return { invoice, items: finalItems };
    });

    if (!result) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    const client = result.invoice.clientId
      ? await db.query.clients.findFirst({ where: eq(clients.id, result.invoice.clientId) })
      : null;

    return NextResponse.json(shapeInvoice(result.invoice, client, result.items));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const deleted = await db
      .delete(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .returning({ id: invoices.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
