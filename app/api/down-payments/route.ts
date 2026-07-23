import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { downPayments, clients, invoices } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapeDownPayment } from "@/lib/shape";

export async function GET() {
  try {
    const userId = await requireUserId();
    const rows = await db.query.downPayments.findMany({
      where: eq(downPayments.userId, userId),
      orderBy: [desc(downPayments.createdAt)],
      with: { client: true, invoice: true },
    });

    return NextResponse.json(
      rows.map((row) => shapeDownPayment(row, row.client, row.invoice?.invoiceNumber))
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const [row] = await db
      .insert(downPayments)
      .values({
        downPaymentNumber: body.downPaymentNumber,
        clientId: body.clientId,
        invoiceId: body.invoiceId || null,
        status: body.status || "draft",
        issueDate: body.issueDate,
        description: body.description || "",
        amount: String(body.amount ?? 0),
        currency: body.currency || "USD",
        notes: body.notes || "",
        userId,
      })
      .returning();

    const [client, invoice] = await Promise.all([
      row.clientId ? db.query.clients.findFirst({ where: eq(clients.id, row.clientId) }) : null,
      row.invoiceId ? db.query.invoices.findFirst({ where: eq(invoices.id, row.invoiceId) }) : null,
    ]);

    return NextResponse.json(shapeDownPayment(row, client, invoice?.invoiceNumber), { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
