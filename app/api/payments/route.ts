import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { payments, invoices } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapePayment } from "@/lib/shape";

export async function GET() {
  try {
    const userId = await requireUserId();
    const rows = await db.query.payments.findMany({
      where: eq(payments.userId, userId),
      orderBy: [desc(payments.createdAt)],
      with: { invoice: { with: { client: true } } },
    });

    return NextResponse.json(
      rows.map((row) =>
        shapePayment(row, row.invoice?.invoiceNumber, row.invoice?.client?.name, row.invoice?.currency)
      )
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const invoice = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, body.invoiceId), eq(invoices.userId, userId)),
      with: { client: true },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    const [row] = await db
      .insert(payments)
      .values({
        invoiceId: body.invoiceId,
        amountUsd: String(body.amountUsd),
        method: body.method,
        reference: body.reference,
        date: body.date,
        userId,
      })
      .returning();

    return NextResponse.json(
      shapePayment(row, invoice.invoiceNumber, invoice.client?.name, invoice.currency),
      { status: 201 }
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
