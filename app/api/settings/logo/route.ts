import { NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireUserId, apiErrorResponse } from "@/lib/auth-guard";
import { r2, R2_BUCKET, R2_PUBLIC_URL, publicUrlFor } from "@/lib/r2";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

function keyFromUrl(url: string): string | null {
  if (!url.startsWith(`${R2_PUBLIC_URL}/`)) return null;
  return url.slice(R2_PUBLIC_URL.length + 1);
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté (PNG, JPEG, WEBP ou SVG uniquement)." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Le fichier dépasse 2 Mo." }, { status: 400 });
    }

    const [existing] = await db
      .select({ logoUrl: settings.logoUrl })
      .from(settings)
      .where(eq(settings.userId, userId))
      .limit(1);

    const extension = file.name.split(".").pop() || "png";
    const key = `logos/${userId}-${Date.now()}.${extension}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: bytes,
        ContentType: file.type,
      })
    );

    const logoUrl = publicUrlFor(key);

    await db
      .update(settings)
      .set({ logoUrl, updatedAt: new Date() })
      .where(eq(settings.userId, userId));

    if (existing?.logoUrl) {
      const oldKey = keyFromUrl(existing.logoUrl);
      if (oldKey) {
        await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: oldKey })).catch(() => {});
      }
    }

    return NextResponse.json({ logoUrl });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE() {
  try {
    const userId = await requireUserId();

    const [existing] = await db
      .select({ logoUrl: settings.logoUrl })
      .from(settings)
      .where(eq(settings.userId, userId))
      .limit(1);

    if (existing?.logoUrl) {
      const key = keyFromUrl(existing.logoUrl);
      if (key) {
        await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })).catch(() => {});
      }
    }

    await db.update(settings).set({ logoUrl: null, updatedAt: new Date() }).where(eq(settings.userId, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
