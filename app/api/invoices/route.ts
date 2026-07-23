import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices, invoiceItems, clients } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapeInvoice } from "@/lib/shape";

export async function GET() {
  try {
    const userId = await requireUserId();
    const rows = await db.query.invoices.findMany({
      where: eq(invoices.userId, userId),
      orderBy: [desc(invoices.createdAt)],
      with: { client: true, items: true },
    });

    return NextResponse.json(rows.map((row) => shapeInvoice(row, row.client, row.items)));
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
      const [invoice] = await tx
        .insert(invoices)
        .values({
          invoiceNumber: body.invoiceNumber,
          clientId: body.clientId,
          status: body.status || "draft",
          issueDate: body.issueDate,
          dueDate: body.dueDate,
          subtotal: String(body.subtotal ?? 0),
          taxRate: String(body.taxRate ?? 18),
          taxAmount: String(body.taxAmount ?? 0),
          totalUsd: String(body.totalUsd ?? 0),
          currency: body.currency || "USD",
          notes: body.notes || "",
          userId,
        })
        .returning();

      let insertedItems: (typeof invoiceItems.$inferSelect)[] = [];
      if (items.length > 0) {
        insertedItems = await tx
          .insert(invoiceItems)
          .values(
            items.map((item) => ({
              invoiceId: invoice.id,
              description: item.description,
              quantity: String(item.quantity),
              unitPrice: String(item.unitPrice),
              total: String(item.total),
            }))
          )
          .returning();
      }

      return { invoice, items: insertedItems };
    });

    const client = result.invoice.clientId
      ? await db.query.clients.findFirst({ where: eq(clients.id, result.invoice.clientId) })
      : null;

    return NextResponse.json(shapeInvoice(result.invoice, client, result.items), { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
