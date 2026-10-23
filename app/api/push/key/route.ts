import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/push/key — public endpoint the browser uses to subscribe:
// returns the shared VAPID public key, or 503 until /api/push/setup has run.
export async function GET() {
  try {
    const row = await prisma.pushConfig.findUnique({ where: { key: "vapid" } });
    if (!row) {
      return NextResponse.json({ ok: false, error: "not set up" }, { status: 503 });
    }
    const { publicKey } = JSON.parse(row.value) as { publicKey: string };
    return NextResponse.json({ ok: true, publicKey });
  } catch {
    return NextResponse.json({ ok: false, error: "not set up" }, { status: 503 });
  }
}
