import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { getBrand, getBaseUrl } from "@/lib/brand";
import { activeCategoriesForBrand } from "@/lib/categories";
import { dateFor } from "@/lib/format";
import { prisma } from "@/lib/db";
import PushButton from "@/components/PushButton";
import AdSlot from "@/components/AdSlot";
import Script from "next/script";

export const dynamic = "force-dynamic";

const brand = getBrand();
const isEn = brand.lang === "en";
const navCategories = activeCategoriesForBrand(brand.key);

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(getBaseUrl()),
    title: { default: `${brand.name} — ${brand.tagline}`, template: `%s | ${brand.name}` },
    description: brand.description,
    openGraph: {
      title: brand.name,
      description: brand.description,
      type: "website",
      locale: brand.locale,
      siteName: brand.name,
    },
    // Google Search Console ownership verification. Google issued the same
    // token for both pp/btn properties (same account) — value kept for
    // both brands, unchanged.
    // NOTE: this token is pp/btn's; sat needs its own Search Console token
    // before claiming the sat property (follow-up, do not reuse blindly).
    // Sat therefore serves NO verification token until one is issued for it.
    ...(brand.key === "sat"
      ? {}
      : { verification: { google: "R6oj57uHxgAtAsGjAdqpzDibrLOnYhIVtBf_gWmi1fQ" } }),
  };
}

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
  const today = dateFor(brand.lang, new Date());

  return (
    <html lang={brand.lang} data-brand={brand.key}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {isEn ? (
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        ) : null}
        <meta name="theme-color" content={brand.themeColor} />
        {brand.gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${brand.gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${brand.gaId}');`}
            </Script>
          </>
        ) : null}
      </head>
      <body>
        <header className="masthead">
          <div className="wrap bar">
            <Link href="/" className="brandmark" aria-label={brand.name}>
              <span className="logo-badge">{brand.key === "btn" ? "B" : brand.key === "sat" ? "S" : "প্র"}</span>
              <span>
                <span className="brandname">{brand.name}</span>
                <br />
                <span className="brandsub">{brand.tagline}</span>
              </span>
            </Link>
            <span className="spacer" />
            <span className="datebox">{today}</span>
            <PushButton lang={brand.lang} />
            <Link href="/search" className="iconbtn" aria-label={isEn ? "Search" : "খুঁজুন"}>
              🔍
            </Link>
          </div>
          <nav className="navrow" aria-label={isEn ? "Sections" : "বিভাগ"}>
            <div className="wrap">
              <Link href="/">{isEn ? "Home" : "প্রচ্ছদ"}</Link>
              {navCategories.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`}>
                  {c.name}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        {ticker.length > 0 && (
          <div className="ticker" aria-label={isEn ? "Breaking news" : "ব্রেকিং নিউজ"}>
            <div className="wrap">
              <span className="label">{isEn ? "Breaking" : "ব্রেকিং"}</span>
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

        <AdSlot slot="header" />

        <main className="wrap">{children}</main>

        <footer>
          <div className="wrap">
            <div className="cols">
              <div>
                <h4>{brand.name}</h4>
                <p className="about">{brand.description}</p>
                {brand.fbPageUrl ? (
                  <p className="about">
                    <a href={brand.fbPageUrl} target="_blank" rel="noreferrer" style={{ display: "inline", minHeight: 0, padding: 0, color: "#fff", fontWeight: 600 }}>
                      {isEn ? "Facebook page →" : "Facebook পেজ →"}
                    </a>
                  </p>
                ) : null}
              </div>
              <div>
                <h4>{isEn ? "Sections" : "বিভাগ"}</h4>
                {navCategories.map((c) => (
                  <Link key={c.slug} href={`/category/${c.slug}`}>
                    {c.name}
                  </Link>
                ))}
              </div>
              <div>
                <h4>{isEn ? "Info" : "তথ্য"}</h4>
                <Link href="/about">{isEn ? "About us" : "আমাদের সম্পর্কে"}</Link>
                <Link href="/contact">{isEn ? "Contact" : "যোগাযোগ"}</Link>
                <Link href="/privacy">{isEn ? "Privacy policy" : "গোপনীয়তা নীতি"}</Link>
                <Link href="/search">{isEn ? "Search" : "খুঁজুন"}</Link>
              </div>
            </div>
            <div className="copy">
              © {new Date().getFullYear()} {brand.name} — {isEn ? "All rights reserved" : "সর্বস্বত্ব সংরক্ষিত"}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
