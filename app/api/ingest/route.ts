import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CATEGORIES, DEFAULT_CATEGORY } from "@/lib/categories";

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

  const brand = b.brand === "btn" ? "btn" : b.brand === "pp" ? "pp" : null;
  const headline = typeof b.headline === "string" ? b.headline.trim() : "";
  const body = typeof b.body === "string" ? b.body.trim() : "";
  const sourceFbid = typeof b.sourceFbid === "string" ? b.sourceFbid.trim() : "";
  if (!brand || !headline || !sourceFbid) {
    return NextResponse.json(
      { ok: false, error: "brand, headline, sourceFbid required" },
      { status: 400 }
    );
  }
  const category = CATEGORIES.some((c) => c.name === b.category)
    ? (b.category as string)
    : DEFAULT_CATEGORY;

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
    return NextResponse.json({ ok: true, id: post.id, path: `/post/${post.id}` });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "db error" }, { status: 500 });
  }
}
