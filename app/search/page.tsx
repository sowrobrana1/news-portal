import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import type { PostCardItem } from "@/lib/format";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const brand = getBrand();
  return { title: brand.lang === "en" ? "Search" : "খুঁজুন" };
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

function digitVariants(q: string): string[] {
  const ascii = q.replace(/[০-৯]/g, (c) => String(BN_DIGITS.indexOf(c)));
  const bn = q.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
  return Array.from(new Set([q, ascii, bn].filter((s) => s.trim().length > 0)));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const brand = getBrand();
  const isEn = brand.lang === "en";
  const q = (searchParams.q || "").trim();

  let results: PostCardItem[] = [];
  if (q) {
    const variants = digitVariants(q);
    try {
      results = await prisma.newsPost.findMany({
        where: {
          brand: brand.key,
          OR: variants.flatMap((v) => [
            { headline: { contains: v, mode: "insensitive" as const } },
            { body: { contains: v, mode: "insensitive" as const } },
          ]),
        },
        orderBy: { publishedAt: "desc" },
        take: 60,
        select: { id: true, headline: true, category: true, imageId: true, publishedAt: true },
      });
    } catch {
      results = [];
    }
  }

  return (
    <div className="layout">
      <div>
        <h1 style={{ margin: "0 0 6px", fontSize: 28 }}>{isEn ? "Search" : "খুঁজুন"}</h1>
        <form className="searchform" method="get" action="/search">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={isEn ? "Search for news…" : "যে খবর খুঁজছেন লিখুন…"}
            aria-label={isEn ? "Search news" : "খবর খুঁজুন"}
            autoFocus
          />
          <button type="submit">{isEn ? "Search" : "খুঁজুন"}</button>
        </form>

        {q &&
          (results.length === 0 ? (
            <p className="empty">
              {isEn ? `No news found for “${q}”. Try another word.` : `“${q}” — কোনো খবর পাওয়া যায়নি। অন্য শব্দে চেষ্টা করুন।`}
            </p>
          ) : (
            <>
              <p style={{ color: "var(--muted)" }}>
                {isEn
                  ? `“${q}” — ${results.length} ${results.length === 1 ? "result" : "results"}`
                  : `“${q}” — ${results.length}টি ফলাফল`}
              </p>
              <div className="grid cols3">
                {results.map((p) => (
                  <NewsCard key={p.id} post={p} />
                ))}
              </div>
            </>
          ))}
      </div>
      <Sidebar />
    </div>
  );
}
