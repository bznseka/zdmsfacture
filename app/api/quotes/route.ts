import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { quotes, quoteItems, clients } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapeQuote } from "@/lib/shape";

export async function GET() {
  try {
    const userId = await requireUserId();
    const rows = await db.query.quotes.findMany({
      where: eq(quotes.userId, userId),
      orderBy: [desc(quotes.createdAt)],
      with: { client: true, items: true },
    });

    return NextResponse.json(rows.map((row) => shapeQuote(row, row.client, row.items)));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const items: Array<{ description: string; quantity: number; unitPrice: number; total: number }> =
      body.items || [];

    const result = await db.transaction(async (tx) => {
      const [quote] = await tx
        .insert(quotes)
        .values({
          quoteNumber: body.quoteNumber,
          clientId: body.clientId,
          status: body.status || "draft",
          issueDate: body.issueDate,
          validUntil: body.validUntil,
          subtotal: String(body.subtotal ?? 0),
          taxRate: String(body.taxRate ?? 18),
          taxAmount: String(body.taxAmount ?? 0),
          total: String(body.total ?? 0),
          currency: body.currency || "USD",
          notes: body.notes || "",
          userId,
        })
        .returning();

      let insertedItems: (typeof quoteItems.$inferSelect)[] = [];
      if (items.length > 0) {
        insertedItems = await tx
          .insert(quoteItems)
          .values(
            items.map((item) => ({
              quoteId: quote.id,
              description: item.description,
              quantity: String(item.quantity),
              unitPrice: String(item.unitPrice),
              total: String(item.total),
            }))
          )
          .returning();
      }

      return { quote, items: insertedItems };
    });

    const client = result.quote.clientId
      ? await db.query.clients.findFirst({ where: eq(clients.id, result.quote.clientId) })
      : null;

    return NextResponse.json(shapeQuote(result.quote, client, result.items), { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
