import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { categoryBySlug } from "@/lib/categories";
import type { PostCardItem } from "@/lib/format";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const brand = getBrand();
  const cat = categoryBySlug(params.slug, brand.key);
  if (!cat) return { title: brand.lang === "en" ? "Section not found" : "বিভাগ পাওয়া যায়নি" };
  return {
    title: `${cat.name} — ${brand.name}`,
    description: brand.lang === "en" ? `Latest ${cat.name} news from ${brand.name}.` : `${brand.name}-এর ${cat.name} বিভাগের সর্বশেষ খবর।`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const brand = getBrand();
  const cat = categoryBySlug(params.slug, brand.key);
  if (!cat) notFound();

  let posts: PostCardItem[] = [];
  try {
    posts = await prisma.newsPost.findMany({
      where: { brand: brand.key, category: cat.name },
      orderBy: { publishedAt: "desc" },
      take: 60,
      select: { id: true, headline: true, category: true, imageId: true, publishedAt: true },
    });
  } catch {
    posts = [];
  }

  return (
    <div className="layout">
      <div>
        <div className="section-head" style={{ marginBottom: 20 }}>
          <h2>{cat.name}</h2>
        </div>
        {posts.length === 0 ? (
          <p className="empty">{brand.lang === "en" ? "No news published in this section yet." : "এই বিভাগে এখনো কোনো খবর প্রকাশ হয়নি।"}</p>
        ) : (
          <div className="grid cols3">
            {posts.map((p) => (
              <NewsCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
      <Sidebar />
    </div>
  );
}
