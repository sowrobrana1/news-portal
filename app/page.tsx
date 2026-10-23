import Link from "next/link";
import { prisma } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { CATEGORIES } from "@/lib/categories";
import { timeAgoBn } from "@/lib/format";
import NewsCard, { type PostLite } from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

const SELECT = {
  id: true,
  headline: true,
  category: true,
  imageId: true,
  publishedAt: true,
  body: true,
} as const;

type PostRow = PostLite & { body: string };

function excerpt(text: string, n = 160): string {
  const clean = text.replace(/^বিস্তারিত:?\s*/, "").trim();
  return clean.length > n ? clean.slice(0, n) + "…" : clean;
}

export default async function HomePage() {
  const brand = getBrand();
  let posts: PostRow[] = [];
  try {
    posts = await prisma.newsPost.findMany({
      where: { brand: brand.key },
      orderBy: { publishedAt: "desc" },
      take: 60,
      select: SELECT,
    });
  } catch {
    posts = [];
  }

  if (posts.length === 0) {
    return (
      <div className="empty">
        <h1>{brand.name}</h1>
        <p>খুব শীঘ্রই এখানে খবর প্রকাশ শুরু হবে।</p>
      </div>
    );
  }

  const [lead, ...rest] = posts;
  const secondary = rest.slice(0, 4);
  const heroIds = new Set([lead.id, ...secondary.map((p) => p.id)]);

  const sections = CATEGORIES.map((cat) => ({
    cat,
    items: posts.filter((p) => p.category === cat.name && !heroIds.has(p.id)).slice(0, 4),
  })).filter((s) => s.items.length > 0);

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero" aria-label="শীর্ষ খবর">
        <article className="lead">
          <Link href={`/post/${lead.id}`} className="thumb">
            {lead.imageId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/img/${lead.imageId}`} alt={lead.headline} />
            ) : null}
          </Link>
          <div className="body">
            <span className="cat">{lead.category}</span>
            <h1>
              <Link href={`/post/${lead.id}`}>{lead.headline}</Link>
            </h1>
            <p>{excerpt(lead.body)}</p>
            <div className="meta" style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>
              🕐 {timeAgoBn(new Date(lead.publishedAt))}
            </div>
          </div>
        </article>
        <div className="side">
          {secondary.map((p) => (
            <article className="mini" key={p.id}>
              <Link href={`/post/${p.id}`} className="thumb">
                {p.imageId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/img/${p.imageId}`} alt={p.headline} loading="lazy" />
                ) : null}
              </Link>
              <div className="body">
                <h3>
                  <Link href={`/post/${p.id}`}>{p.headline}</Link>
                </h3>
                <div className="meta" style={{ color: "var(--muted)", fontSize: 13 }}>
                  {timeAgoBn(new Date(p.publishedAt))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="layout" style={{ marginTop: 30 }}>
        <div>
          {/* ── Latest ── */}
          <section className="section" style={{ marginTop: 0 }}>
            <div className="section-head">
              <h2>সর্বশেষ খবর</h2>
            </div>
            <div className="grid cols3">
              {rest.slice(0, 6).map((p) => (
                <NewsCard key={p.id} post={p} />
              ))}
            </div>
          </section>

          {/* ── Category sections ── */}
          {sections.map(({ cat, items }) => (
            <section className="section" key={cat.slug}>
              <div className="section-head">
                <h2>{cat.name}</h2>
                <Link href={`/category/${cat.slug}`}>আরও →</Link>
              </div>
              <div className="grid cols3">
                {items.map((p) => (
                  <NewsCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <Sidebar />
      </div>
    </>
  );
}
