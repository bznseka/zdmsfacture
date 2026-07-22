import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { shapeClient } from "@/lib/shape";

export async function GET() {
  try {
    const userId = await requireUserId();
    const rows = await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(asc(clients.name));

    return NextResponse.json(rows.map(shapeClient));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const [row] = await db
      .insert(clients)
      .values({
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        country: body.country || "",
        userId,
      })
      .returning();

    return NextResponse.json(shapeClient(row), { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
