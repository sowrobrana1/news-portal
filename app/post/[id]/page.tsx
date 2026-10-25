import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getBrand, getBaseUrl } from "@/lib/brand";
import { slugForCategory } from "@/lib/categories";
import AdSlot from "@/components/AdSlot";
import { timeAgoFor, dateFor, timeBn, timeEn } from "@/lib/format";
import type { PostCardItem } from "@/lib/format";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";
import ShareButtons from "./ShareButtons";

export const dynamic = "force-dynamic";

async function getPost(id: number) {
  const brand = getBrand();
  try {
    return await prisma.newsPost.findFirst({ where: { id, brand: brand.key } });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const brand = getBrand();
  const post = await getPost(Number(params.id));
  if (!post) return { title: brand.lang === "en" ? "News not found" : "খবর পাওয়া যায়নি" };
  const desc = post.body.replace(/\s+/g, " ").slice(0, 160);
  const images = post.imageId ? [`${getBaseUrl()}/img/${post.imageId}`] : [];
  return {
    title: post.headline,
    description: desc,
    openGraph: {
      title: post.headline,
      description: desc,
      type: "article",
      locale: brand.locale,
      siteName: brand.name,
      images,
      publishedTime: new Date(post.publishedAt).toISOString(),
    },
    twitter: { card: "summary_large_image", title: post.headline, description: desc, images },
  };
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const brand = getBrand();
  const isEn = brand.lang === "en";
  const id = Number(params.id);
  const post = await getPost(id);
  if (!post) notFound();

  // Count the read (fail-soft) — but never count the admin's own visits:
  // the /admin panel sets an "np_admin" cookie on the browser used to log in.
  const isAdmin = !!cookies().get("np_admin");
  if (!isAdmin) {
    prisma.newsPost
      .update({ where: { id: post.id }, data: { views: { increment: 1 } } })
      .catch(() => {});
  }

  let related: PostCardItem[] = [];
  let prev: { id: number; headline: string } | null = null;
  let next: { id: number; headline: string } | null = null;
  try {
    [related, prev, next] = await Promise.all([
      prisma.newsPost.findMany({
        where: { brand: brand.key, category: post.category, id: { not: post.id } },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: { id: true, headline: true, category: true, imageId: true, publishedAt: true },
      }),
      prisma.newsPost.findFirst({
        where: { brand: brand.key, publishedAt: { lt: post.publishedAt } },
        orderBy: { publishedAt: "desc" },
        select: { id: true, headline: true },
      }),
      prisma.newsPost.findFirst({
        where: { brand: brand.key, publishedAt: { gt: post.publishedAt } },
        orderBy: { publishedAt: "asc" },
        select: { id: true, headline: true },
      }),
    ]);
  } catch {
    related = [];
  }

  const published = new Date(post.publishedAt);
  const base = getBaseUrl();
  const url = `${base}/post/${post.id}`;

  // NewsArticle structured data — helps Google understand each story
  // (News / Discover eligibility, richer results).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.headline,
    description: post.body.replace(/\s+/g, " ").slice(0, 200),
    datePublished: published.toISOString(),
    dateModified: published.toISOString(),
    inLanguage: brand.lang,
    articleSection: post.category,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: brand.name, url: base },
    publisher: { "@type": "Organization", name: brand.name, url: base },
    ...(post.imageId ? { image: [`${base}/img/${post.imageId}`] } : {}),
  };

  return (
    <div className="layout">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <nav className="crumbs" aria-label={isEn ? "Breadcrumb" : "ব্রেডক্রাম্ব"}>
          <Link href="/">{isEn ? "Home" : "প্রচ্ছদ"}</Link>
          <span>›</span>
          <Link href={`/category/${slugForCategory(post.category, brand.key)}`}>{post.category}</Link>
          <span>›</span>
          <span>{isEn ? "News" : "খবর"}</span>
        </nav>

        <span className="cat">{post.category}</span>
        <h1>{post.headline}</h1>

        <div className="byline">
          <span>
            ✍️ <b>{isEn ? "Staff reporter" : "নিজস্ব প্রতিবেদক"}</b>
          </span>
          <span>
            🕐 {timeAgoFor(brand.lang, published)} ({dateFor(brand.lang, published)}, {isEn ? timeEn(published) : timeBn(published)})
          </span>
        </div>

        {post.imageId ? (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/img/${post.imageId}`} alt={post.headline} />
          </figure>
        ) : null}

        <div className="text">{post.body}</div>

        <AdSlot slot="article" />

        <ShareButtons url={url} title={post.headline} lang={brand.lang} />

        {(prev || next) && (
          <div className="prevnext">
            {prev ? (
              <Link href={`/post/${prev.id}`}>
                <small>{isEn ? "← Previous news" : "← আগের খবর"}</small>
                <b>{prev.headline}</b>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/post/${next.id}`} style={{ textAlign: "right" }}>
                <small>{isEn ? "Next news →" : "পরের খবর →"}</small>
                <b>{next.headline}</b>
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}

        {related.length > 0 && (
          <section className="section">
            <div className="section-head">
              <h2>{isEn ? "More news" : "আরও খবর"}</h2>
              <Link href={`/category/${slugForCategory(post.category, brand.key)}`}>{isEn ? `All ${post.category} →` : `সব ${post.category} →`}</Link>
            </div>
            <div className="grid">
              {related.map((p) => (
                <NewsCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}
      </article>

      <Sidebar />
    </div>
  );
}
