import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/db";
import { categoriesForBrand, defaultCategoryForBrand } from "@/lib/categories";
import { getBaseUrl } from "@/lib/brand";

export const dynamic = "force-dynamic";

// POST /api/ingest — used by the Facebook posting pipelines to mirror every
// published card to the brand's website. Auth: header x-ingest-key = INGEST_KEY.
// Body: { brand, headline, body, imageBase64, mime, sourceFbid, category? }
// Dedupes on (brand, sourceFbid) — re-sending the same item is a no-op.
export async function POST(req: NextRequest) {
  const key = req.headers.get("x-ingest-key");
  if (!process.env.INGEST_KEY || key !== process.env.INGEST_KEY) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const brand = b.brand === "btn" ? "btn" : b.brand === "pp" ? "pp" : b.brand === "sat" ? "sat" : null;
  const headline = typeof b.headline === "string" ? b.headline.trim() : "";
  const body = typeof b.body === "string" ? b.body.trim() : "";
  const sourceFbid = typeof b.sourceFbid === "string" ? b.sourceFbid.trim() : "";
  if (!brand || !headline || !sourceFbid) {
    return NextResponse.json(
      { ok: false, error: "brand, headline, sourceFbid required" },
      { status: 400 }
    );
  }
  // Category must match this brand's list (pp/btn = Bengali list,
  // sat = country list incl. inactive Pakistan/Nepal/Sri Lanka); otherwise
  // fall back to that brand's default. pp/btn behaviour is unchanged.
  const category = categoriesForBrand(brand).some((c) => c.name === b.category)
    ? (b.category as string)
    : defaultCategoryForBrand(brand);

  try {
    const existing = await prisma.newsPost.findUnique({
      where: { brand_sourceFbid: { brand, sourceFbid } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ ok: true, deduped: true, id: existing.id, path: `/post/${existing.id}` });
    }

    let imageId: number | null = null;
    if (typeof b.imageBase64 === "string" && b.imageBase64.length > 0) {
      const data = Buffer.from(b.imageBase64, "base64");
      const img = await prisma.postImage.create({
        data: { data, mime: typeof b.mime === "string" ? b.mime : "image/png" },
        select: { id: true },
      });
      imageId = img.id;
    }

    const post = await prisma.newsPost.create({
      data: {
        brand,
        headline,
        body: body || headline,
        category,
        sourceFbid,
        imageId,
        publishedAt: b.publishedAt ? new Date(b.publishedAt) : new Date(),
      },
      select: { id: true },
    });

    // Notify this brand's push subscribers about the new story. Fail-soft:
    // a push problem must never fail the ingest itself.
    await sendPushToBrand(brand, {
      title: headline,
      body: (body || headline).slice(0, 120),
      url: `${getBaseUrl()}/post/${post.id}`,
      icon: imageId ? `${getBaseUrl()}/img/${imageId}` : undefined,
    }).catch(() => {});

    return NextResponse.json({ ok: true, id: post.id, path: `/post/${post.id}` });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "db error" }, { status: 500 });
  }
}

// Sends one Web Push payload to every subscriber of the brand. Dead
// endpoints (404/410 from the push service) are removed from the table.
async function sendPushToBrand(
  brand: string,
  payload: { title: string; body: string; url: string; icon?: string }
) {
  const row = await prisma.pushConfig.findUnique({ where: { key: "vapid" } });
  if (!row) return; // setup endpoint has not run yet — nothing to send with.
  const { publicKey, privateKey } = JSON.parse(row.value) as {
    publicKey: string;
    privateKey: string;
  };
  webpush.setVapidDetails(
    "mailto:sowrobhasanrana39@gmail.com",
    publicKey,
    privateKey
  );

  const subs = await prisma.pushSubscription.findMany({
    where: { brand },
    take: 1000,
  });
  if (subs.length === 0) return;

  const data = JSON.stringify(payload);
  await Promise.allSettled(
    subs.map(async (s: (typeof subs)[number]) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          data
        );
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await prisma.pushSubscription
            .delete({ where: { id: s.id } })
            .catch(() => {});
        }
      }
    })
  );
}
