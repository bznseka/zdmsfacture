import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { refunds, invoices } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapeRefund } from "@/lib/shape";

export async function GET() {
  try {
    const userId = await requireUserId();
    const rows = await db.query.refunds.findMany({
      where: eq(refunds.userId, userId),
      orderBy: [desc(refunds.createdAt)],
      with: { invoice: { with: { client: true } } },
    });

    return NextResponse.json(
      rows.map((row) => shapeRefund(row, row.invoice?.invoiceNumber, row.invoice?.client?.name))
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
      .insert(refunds)
      .values({
        invoiceId: body.invoiceId,
        amountUsd: String(body.amountUsd),
        amountCdf: String(body.amountCdf),
        status: body.status || "pending",
        reason: body.reason,
        date: body.date,
        userId,
      })
      .returning();

    return NextResponse.json(shapeRefund(row, invoice.invoiceNumber, invoice.client?.name), {
      status: 201,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
