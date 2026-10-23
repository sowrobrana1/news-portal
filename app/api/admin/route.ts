import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Admin-lite API. Auth: header x-admin-password = env ADMIN_PASSWORD.
// Actions: { action: "list" } | { action: "delete", id }
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
      const brand = b.brand === "btn" ? "btn" : "pp";
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

    return NextResponse.json({ ok: false, error: "unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "db error" }, { status: 500 });
  }
}
