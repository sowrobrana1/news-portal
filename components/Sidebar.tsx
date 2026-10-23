import Link from "next/link";
import { prisma } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { timeAgoBn } from "@/lib/format";

export default async function Sidebar() {
  const brand = getBrand();
  let mostRead: { id: number; headline: string; views: number }[] = [];
  let latest: { id: number; headline: string; publishedAt: Date }[] = [];
  try {
    [mostRead, latest] = await Promise.all([
      prisma.newsPost.findMany({
        where: { brand: brand.key, views: { gt: 0 } },
        orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
        take: 5,
        select: { id: true, headline: true, views: true },
      }),
      prisma.newsPost.findMany({
        where: { brand: brand.key },
        orderBy: { publishedAt: "desc" },
        take: 6,
        select: { id: true, headline: true, publishedAt: true },
      }),
    ]);
    if (mostRead.length === 0) {
      mostRead = latest.slice(0, 5).map((p) => ({ id: p.id, headline: p.headline, views: 0 }));
    }
  } catch {
    // DB not ready — render empty sidebar boxes gracefully.
  }

  return (
    <aside>
      <div className="sidebox">
        <h3>সর্বাধিক পঠিত</h3>
        <ol className="ranklist">
          {mostRead.map((p) => (
            <li key={p.id}>
              <Link href={`/post/${p.id}`}>{p.headline}</Link>
            </li>
          ))}
          {mostRead.length === 0 && <li>এখনো কোনো খবর নেই</li>}
        </ol>
      </div>
      <div className="sidebox">
        <h3>সর্বশেষ</h3>
        <ul className="plainlist">
          {latest.map((p) => (
            <li key={p.id}>
              <Link href={`/post/${p.id}`}>{p.headline}</Link>
              <span className="meta">{timeAgoBn(new Date(p.publishedAt))}</span>
            </li>
          ))}
          {latest.length === 0 && <li>এখনো কোনো খবর নেই</li>}
        </ul>
      </div>
    </aside>
  );
}
