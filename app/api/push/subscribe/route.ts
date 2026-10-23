import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBrand } from "@/lib/brand";

export const dynamic = "force-dynamic";

// POST /api/push/subscribe — stores (or removes) a browser push subscription
// for THIS brand's site (brand comes from the deployment, never the client).
// Body: { endpoint, keys: { p256dh, auth } }
//   or  { action: "unsubscribe", endpoint }
export async function POST(req: NextRequest) {
  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const endpoint = typeof b?.endpoint === "string" ? b.endpoint : "";
  if (!endpoint) {
    return NextResponse.json({ ok: false, error: "endpoint required" }, { status: 400 });
  }

  try {
    if (b.action === "unsubscribe") {
      await prisma.pushSubscription.deleteMany({ where: { endpoint } });
      return NextResponse.json({ ok: true });
    }

    const p256dh = typeof b?.keys?.p256dh === "string" ? b.keys.p256dh : "";
    const auth = typeof b?.keys?.auth === "string" ? b.keys.auth : "";
    if (!p256dh || !auth) {
      return NextResponse.json({ ok: false, error: "keys required" }, { status: 400 });
    }

    const brand = getBrand().key;
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { brand, endpoint, p256dh, auth },
      update: { brand, p256dh, auth },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "db error" }, { status: 500 });
  }
}
