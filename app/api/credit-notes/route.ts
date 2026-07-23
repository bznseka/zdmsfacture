import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { creditNotes, invoices } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapeCreditNote } from "@/lib/shape";

export async function GET() {
  try {
    const userId = await requireUserId();
    const rows = await db.query.creditNotes.findMany({
      where: eq(creditNotes.userId, userId),
      orderBy: [desc(creditNotes.createdAt)],
      with: { invoice: { with: { client: true } } },
    });

    return NextResponse.json(
      rows.map((row) => shapeCreditNote(row, row.invoice?.invoiceNumber, row.invoice?.client?.name))
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
      .insert(creditNotes)
      .values({
        creditNoteNumber: body.creditNoteNumber,
        invoiceId: body.invoiceId,
        status: body.status || "draft",
        issueDate: body.issueDate,
        amount: String(body.amount ?? invoice.totalUsd),
        reason: body.reason || "",
        currency: invoice.currency,
        userId,
      })
      .returning();

    return NextResponse.json(
      shapeCreditNote(row, invoice.invoiceNumber, invoice.client?.name),
      { status: 201 }
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
