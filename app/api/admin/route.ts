import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { categoriesForBrand, defaultCategoryForBrand } from "@/lib/categories";

export const dynamic = "force-dynamic";

// Admin API. Auth: header x-admin-password = env ADMIN_PASSWORD.
// Actions: { action: "list" } | { action: "delete", id }
//          | { action: "create", brand, headline, category, body, imageBase64?, mime? }
//          | { action: "stats", brand }
export async function POST(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  if (!process.env.ADMIN_PASSWORD || pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  try {
    if (b.action === "list") {
      const brand = b.brand === "btn" ? "btn" : b.brand === "sat" ? "sat" : "pp";
      const posts = await prisma.newsPost.findMany({
        where: { brand },
        orderBy: { publishedAt: "desc" },
        take: 100,
        select: {
          id: true,
          headline: true,
          category: true,
          views: true,
          publishedAt: true,
          sourceFbid: true,
        },
      });
      return NextResponse.json({ ok: true, posts });
    }

    if (b.action === "delete") {
      const id = Number(b.id);
      if (!Number.isFinite(id)) {
        return NextResponse.json({ ok: false, error: "bad id" }, { status: 400 });
      }
      const post = await prisma.newsPost.findUnique({ where: { id } });
      if (!post) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
      await prisma.newsPost.delete({ where: { id } });
      if (post.imageId) {
        await prisma.postImage.delete({ where: { id: post.imageId } }).catch(() => {});
      }
      return NextResponse.json({ ok: true });
    }

    if (b.action === "create") {
      const brand = b.brand === "btn" ? "btn" : b.brand === "sat" ? "sat" : "pp";
      const headline = typeof b.headline === "string" ? b.headline.trim() : "";
      const body = typeof b.body === "string" ? b.body.trim() : "";
      if (!headline) {
        return NextResponse.json({ ok: false, error: "headline required" }, { status: 400 });
      }
      const category = categoriesForBrand(brand).some((c) => c.name === b.category)
        ? (b.category as string)
        : defaultCategoryForBrand(brand);

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
          sourceFbid: `manual-${Date.now()}`,
          imageId,
          publishedAt: new Date(),
        },
        select: { id: true },
      });
      return NextResponse.json({ ok: true, id: post.id, path: `/post/${post.id}` });
    }

    if (b.action === "stats") {
      const brand = b.brand === "btn" ? "btn" : b.brand === "sat" ? "sat" : "pp";
      const dayStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      const todayStart = new Date(`${dayStr}T00:00:00+06:00`);

      const [totalPosts, agg, todayPosts, top] = await Promise.all([
        prisma.newsPost.count({ where: { brand } }),
        prisma.newsPost.aggregate({ where: { brand }, _sum: { views: true } }),
        prisma.newsPost.count({ where: { brand, publishedAt: { gte: todayStart } } }),
        prisma.newsPost.findMany({
          where: { brand },
          orderBy: { views: "desc" },
          take: 5,
          select: { id: true, headline: true, views: true },
        }),
      ]);
      return NextResponse.json({
        ok: true,
        totalPosts,
        totalViews: agg._sum.views ?? 0,
        todayPosts,
        top,
      });
    }

    return NextResponse.json({ ok: false, error: "unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "db error" }, { status: 500 });
  }
}
