import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/push/setup — one-time (idempotent) bootstrap for Web Push:
// creates the PushSubscription / PushConfig tables if missing and stores a
// shared VAPID key pair in PushConfig. Auth: header x-ingest-key = INGEST_KEY.
export async function POST(req: NextRequest) {
  const key = req.headers.get("x-ingest-key");
  if (!process.env.INGEST_KEY || key !== process.env.INGEST_KEY) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PushSubscription" (
        "id" SERIAL PRIMARY KEY,
        "brand" TEXT NOT NULL,
        "endpoint" TEXT NOT NULL,
        "p256dh" TEXT NOT NULL,
        "auth" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key"
      ON "PushSubscription"("endpoint")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "PushSubscription_brand_idx"
      ON "PushSubscription"("brand")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PushConfig" (
        "key" TEXT PRIMARY KEY,
        "value" TEXT NOT NULL
      )
    `);

    let row = await prisma.pushConfig.findUnique({ where: { key: "vapid" } });
    if (!row) {
      const keys = webpush.generateVAPIDKeys();
      row = await prisma.pushConfig.create({
        data: { key: "vapid", value: JSON.stringify(keys) },
      });
    }
    const { publicKey } = JSON.parse(row.value) as { publicKey: string };
    return NextResponse.json({ ok: true, publicKey });
  } catch {
    return NextResponse.json({ ok: false, error: "db error" }, { status: 500 });
  }
}
