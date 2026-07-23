import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { quotes } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const { status } = await request.json();

    const [row] = await db
      .update(quotes)
      .set({ status })
      .where(and(eq(quotes.id, id), eq(quotes.userId, userId)))
      .returning({ id: quotes.id, status: quotes.status });

    if (!row) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
