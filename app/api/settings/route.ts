import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapeSettings } from "@/lib/shape";

export async function GET() {
  try {
    const userId = await requireUserId();
    let [row] = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);

    if (!row) {
      [row] = await db.insert(settings).values({ userId }).returning();
    }

    return NextResponse.json(shapeSettings(row));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const updates: Partial<typeof settings.$inferInsert> = { updatedAt: new Date() };
    if (body.companyName !== undefined) updates.companyName = body.companyName;
    if (body.email !== undefined) updates.email = body.email;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.address !== undefined) updates.address = body.address;
    if (body.taxNumber !== undefined) updates.taxNumber = body.taxNumber;
    if (body.taxRate !== undefined) updates.taxRate = String(body.taxRate);
    if (body.mobileMoneyDetails !== undefined) updates.mobileMoneyDetails = body.mobileMoneyDetails;

    const [row] = await db
      .update(settings)
      .set(updates)
      .where(eq(settings.userId, userId))
      .returning();

    if (!row) {
      return NextResponse.json({ error: "Paramètres introuvables" }, { status: 404 });
    }

    return NextResponse.json(shapeSettings(row));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
