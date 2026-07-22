import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { clients, invoices, payments, refunds } from "@/db/schema";
import { requireAdmin, apiErrorResponse } from "@/lib/auth-guard";
import { shapeClient, shapeInvoice, shapePayment, shapeRefund } from "@/lib/shape";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const [clientRows, invoiceRows, paymentRows, refundRows] = await Promise.all([
      db.select().from(clients).where(eq(clients.userId, id)).orderBy(clients.name),
      db.query.invoices.findMany({
        where: eq(invoices.userId, id),
        orderBy: [desc(invoices.createdAt)],
        with: { client: true, items: true },
      }),
      db.query.payments.findMany({
        where: eq(payments.userId, id),
        orderBy: [desc(payments.createdAt)],
        with: { invoice: { with: { client: true } } },
      }),
      db.query.refunds.findMany({
        where: eq(refunds.userId, id),
        orderBy: [desc(refunds.createdAt)],
        with: { invoice: { with: { client: true } } },
      }),
    ]);

    return NextResponse.json({
      clients: clientRows.map(shapeClient),
      invoices: invoiceRows.map((row) => shapeInvoice(row, row.client, row.items)),
      payments: paymentRows.map((row) =>
        shapePayment(row, row.invoice?.invoiceNumber, row.invoice?.client?.name)
      ),
      refunds: refundRows.map((row) =>
        shapeRefund(row, row.invoice?.invoiceNumber, row.invoice?.client?.name)
      ),
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
