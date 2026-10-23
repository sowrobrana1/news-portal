# News Portal — প্রথম প্রহর নিউজ + BTN News

One Next.js 14 codebase that powers **two separate-looking Bengali news sites**.
Which brand a deployment shows is chosen by the `NEXT_PUBLIC_BRAND` env var
(`pp` = প্রথম প্রহর নিউজ, `btn` = BTN News). Both share one database; rows are
separated by the `brand` column, so the two sites never mix.

## Features

- Sticky masthead (logo, Bangla date, search), category nav, breaking-news ticker
- Hero lead story + secondary stories, সর্বশেষ grid, per-category sections
- Category pages, search (Bengali-digit safe), সর্বাধিক পঠিত (view counter) + সর্বশেষ sidebar
- Post page: breadcrumbs, নিজস্ব প্রতিবেদক byline, Bangla relative time, share
  buttons (Facebook / WhatsApp / copy link), আগের/পরের খবর, আরও খবর
- Static pages: আমাদের সম্পর্কে, যোগাযোগ, গোপনীয়তা নীতি; branded 404
- SEO: per-post Open Graph, dynamic sitemap.xml, robots.txt
- Images stored in Postgres (`PostImage`), served via `/img/[id]`
- Ingest API for the Facebook pipelines: `POST /api/ingest` (header `x-ingest-key`)
- Admin-lite at `/admin` (password: `ADMIN_PASSWORD`) — list + delete posts

## Setup

See **DEPLOY.md** for the phone-friendly step-by-step (SQL → two Vercel projects).

## Local dev

```bash
cp .env.example .env.local   # fill in real values
npm install
npm run dev
```

## Seed old posts

```bash
DATABASE_URL=... npm run seed     # or INGEST_BASE=... INGEST_KEY=... npm run seed
```
