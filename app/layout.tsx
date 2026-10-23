import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { getBrand, getBaseUrl } from "@/lib/brand";
import { CATEGORIES } from "@/lib/categories";
import { dateBn } from "@/lib/format";
import { prisma } from "@/lib/db";
import PushButton from "@/components/PushButton";

export const dynamic = "force-dynamic";

const brand = getBrand();

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: { default: `${brand.name} — ${brand.tagline}`, template: `%s | ${brand.name}` },
  description: brand.description,
  openGraph: {
    title: brand.name,
    description: brand.description,
    type: "website",
    locale: "bn_BD",
    siteName: brand.name,
  },
  // Google Search Console ownership verification. Google issued the same
  // token for both properties (same account) — value kept for both brands.
  verification: { google: "R6oj57uHxgAtAsGjAdqpzDibrLOnYhIVtBf_gWmi1fQ" },
};

async function latestHeadlines(): Promise<{ id: number; headline: string }[]> {
  try {
    return await prisma.newsPost.findMany({
      where: { brand: brand.key },
      orderBy: { publishedAt: "desc" },
      take: 8,
      select: { id: true, headline: true },
    });
  } catch {
    return [];
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ticker = await latestHeadlines();
  const today = dateBn(new Date());

  return (
    <html lang="bn" data-brand={brand.key}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content={brand.themeColor} />
      </head>
      <body>
        <header className="masthead">
          <div className="wrap bar">
            <Link href="/" className="brandmark" aria-label={brand.name}>
              <span className="logo-badge">{brand.key === "btn" ? "B" : "প্র"}</span>
              <span>
                <span className="brandname">{brand.name}</span>
                <br />
                <span className="brandsub">{brand.tagline}</span>
              </span>
            </Link>
            <span className="spacer" />
            <span className="datebox">{today}</span>
            <PushButton />
            <Link href="/search" className="iconbtn" aria-label="খুঁজুন">
              🔍
            </Link>
          </div>
          <nav className="navrow" aria-label="বিভাগ">
            <div className="wrap">
              <Link href="/">প্রচ্ছদ</Link>
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`}>
                  {c.name}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        {ticker.length > 0 && (
          <div className="ticker" aria-label="ব্রেকিং নিউজ">
            <div className="wrap">
              <span className="label">ব্রেকিং</span>
              <div className="track">
                <div className="scroll">
                  {ticker.map((p) => (
                    <Link key={p.id} href={`/post/${p.id}`}>
                      {p.headline}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="wrap">{children}</main>

        <footer>
          <div className="wrap">
            <div className="cols">
              <div>
                <h4>{brand.name}</h4>
                <p className="about">{brand.description}</p>
                <p className="about">
                  <a href={brand.fbPageUrl} target="_blank" rel="noreferrer" style={{ display: "inline", minHeight: 0, padding: 0, color: "#fff", fontWeight: 600 }}>
                    Facebook পেজ →
                  </a>
                </p>
              </div>
              <div>
                <h4>বিভাগ</h4>
                {CATEGORIES.map((c) => (
                  <Link key={c.slug} href={`/category/${c.slug}`}>
                    {c.name}
                  </Link>
                ))}
              </div>
              <div>
                <h4>তথ্য</h4>
                <Link href="/about">আমাদের সম্পর্কে</Link>
                <Link href="/contact">যোগাযোগ</Link>
                <Link href="/privacy">গোপনীয়তা নীতি</Link>
                <Link href="/search">খুঁজুন</Link>
              </div>
            </div>
            <div className="copy">
              © {new Date().getFullYear()} {brand.name} — সর্বস্বত্ব সংরক্ষিত
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
