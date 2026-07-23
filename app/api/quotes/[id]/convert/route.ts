import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { quotes, invoices, invoiceItems, clients, settings } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapeInvoice } from "@/lib/shape";

function getCompanyInitials(name: string): string {
  if (!name) return "ZDM";
  const words = name.trim().split(/\s+/);
  if (words[0] && words[0] === words[0].toUpperCase() && words[0].length >= 2) {
    return words[0].replace(/[^A-Z]/g, "");
  }
  const initials = words
    .map((w) => w.charAt(0).toUpperCase())
    .join("")
    .replace(/[^A-Z]/g, "");
  return initials.slice(0, 4) || name.slice(0, 3).toUpperCase();
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const quote = await db.query.quotes.findFirst({
      where: and(eq(quotes.id, id), eq(quotes.userId, userId)),
      with: { items: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }
    if (quote.convertedInvoiceId) {
      return NextResponse.json({ error: "Ce devis a déjà été converti en facture" }, { status: 400 });
    }

    const [settingsRow] = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;
    const initials = getCompanyInitials(settingsRow?.companyName || "");

    const yearInvoiceNumbers = (
      await db
        .select({ invoiceNumber: invoices.invoiceNumber })
        .from(invoices)
        .where(eq(invoices.userId, userId))
    )
      .map((r) => r.invoiceNumber)
      .filter((n) => n.startsWith(prefix));

    const numbers = yearInvoiceNumbers.map((n) => {
      const parts = n.split("-");
      const num = parts.length >= 3 ? parseInt(parts[2], 10) : 0;
      return isNaN(num) ? 0 : num;
    });
    const nextNum = Math.max(...numbers, 42) + 1;
    const invoiceNumber = `${prefix}${nextNum.toString().padStart(4, "0")}-${initials}`;

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30);
    const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

    const result = await db.transaction(async (tx) => {
      const [invoice] = await tx
        .insert(invoices)
        .values({
          invoiceNumber,
          clientId: quote.clientId,
          status: "draft",
          issueDate: toIsoDate(today),
          dueDate: toIsoDate(dueDate),
          subtotal: quote.subtotal,
          taxRate: quote.taxRate,
          taxAmount: quote.taxAmount,
          totalUsd: quote.total,
          currency: quote.currency,
          notes: quote.notes,
          userId,
        })
        .returning();

      let insertedItems: (typeof invoiceItems.$inferSelect)[] = [];
      if (quote.items.length > 0) {
        insertedItems = await tx
          .insert(invoiceItems)
          .values(
            quote.items.map((item) => ({
              invoiceId: invoice.id,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            }))
          )
          .returning();
      }

      await tx.update(quotes).set({ convertedInvoiceId: invoice.id }).where(eq(quotes.id, id));

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
