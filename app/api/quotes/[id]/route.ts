import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { quotes, quoteItems, clients } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapeQuote } from "@/lib/shape";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();
    const items:
      | Array<{ description: string; quantity: number; unitPrice: number; total: number }>
      | undefined = body.items;

    const result = await db.transaction(async (tx) => {
      const updates: Partial<typeof quotes.$inferInsert> = {};
      if (body.clientId !== undefined) updates.clientId = body.clientId;
      if (body.status !== undefined) updates.status = body.status;
      if (body.issueDate !== undefined) updates.issueDate = body.issueDate;
      if (body.validUntil !== undefined) updates.validUntil = body.validUntil;
      if (body.subtotal !== undefined) updates.subtotal = String(body.subtotal);
      if (body.taxRate !== undefined) updates.taxRate = String(body.taxRate);
      if (body.taxAmount !== undefined) updates.taxAmount = String(body.taxAmount);
      if (body.total !== undefined) updates.total = String(body.total);
      if (body.notes !== undefined) updates.notes = body.notes;

      const [quote] = await tx
        .update(quotes)
        .set(updates)
        .where(and(eq(quotes.id, id), eq(quotes.userId, userId)))
        .returning();

      if (!quote) return null;

      let finalItems: (typeof quoteItems.$inferSelect)[];
      if (items) {
        await tx.delete(quoteItems).where(eq(quoteItems.quoteId, id));
        finalItems =
          items.length > 0
            ? await tx
                .insert(quoteItems)
                .values(
                  items.map((item) => ({
                    quoteId: id,
                    description: item.description,
                    quantity: String(item.quantity),
                    unitPrice: String(item.unitPrice),
                    total: String(item.total),
                  }))
                )
                .returning()
            : [];
      } else {
        finalItems = await tx.select().from(quoteItems).where(eq(quoteItems.quoteId, id));
      }

      return { quote, items: finalItems };
    });

    if (!result) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }

    const client = result.quote.clientId
      ? await db.query.clients.findFirst({ where: eq(clients.id, result.quote.clientId) })
      : null;

    return NextResponse.json(shapeQuote(result.quote, client, result.items));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const deleted = await db
      .delete(quotes)
      .where(and(eq(quotes.id, id), eq(quotes.userId, userId)))
      .returning({ id: quotes.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
