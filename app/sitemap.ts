import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getBrand, getBaseUrl } from "@/lib/brand";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brand = getBrand();
  const BASE = getBaseUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    ...CATEGORIES.map((c) => ({
      url: `${BASE}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
  ];

  try {
    const posts = await prisma.newsPost.findMany({
      where: { brand: brand.key },
      orderBy: { publishedAt: "desc" },
      take: 2000,
      select: { id: true, publishedAt: true },
    });
    for (const p of posts) {
      entries.push({
        url: `${BASE}/post/${p.id}`,
        lastModified: new Date(p.publishedAt),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // DB unreachable — serve the static part only.
  }

  return entries;
}
