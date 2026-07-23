import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { downPayments } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const { status } = await request.json();

    const [row] = await db
      .update(downPayments)
      .set({ status })
      .where(and(eq(downPayments.id, id), eq(downPayments.userId, userId)))
      .returning({ id: downPayments.id, status: downPayments.status });

    if (!row) {
      return NextResponse.json({ error: "Acompte introuvable" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
