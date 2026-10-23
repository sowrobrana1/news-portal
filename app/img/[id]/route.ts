import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Serves card images stored in Postgres (PostImage.data).
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return new NextResponse("Not found", { status: 404 });
  try {
    const img = await prisma.postImage.findUnique({ where: { id } });
    if (!img) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(Buffer.from(img.data), {
      headers: {
        "Content-Type": img.mime || "image/png",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return new NextResponse("Error", { status: 500 });
  }
}
