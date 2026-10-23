-- News portal tables (প্রথম প্রহর নিউজ + BTN News — one shared pair of tables,
-- rows are separated by the "brand" column: 'pp' | 'btn').
-- Run this ONCE in Supabase → SQL Editor. Safe to re-run (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS "PostImage" (
    "id"   SERIAL PRIMARY KEY,
    "data" BYTEA NOT NULL,
    "mime" TEXT  NOT NULL DEFAULT 'image/png'
);

CREATE TABLE IF NOT EXISTS "NewsPost" (
    "id"          SERIAL PRIMARY KEY,
    "brand"       TEXT NOT NULL,
    "headline"    TEXT NOT NULL,
    "category"    TEXT NOT NULL DEFAULT 'জাতীয়',
    "views"       INTEGER NOT NULL DEFAULT 0,
    "body"        TEXT NOT NULL,
    "imageId"     INTEGER,
    "sourceFbid"  TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "NewsPost_brand_sourceFbid_key"
    ON "NewsPost"("brand", "sourceFbid");

CREATE INDEX IF NOT EXISTS "NewsPost_brand_publishedAt_idx"
    ON "NewsPost"("brand", "publishedAt");

CREATE INDEX IF NOT EXISTS "NewsPost_brand_category_publishedAt_idx"
    ON "NewsPost"("brand", "category", "publishedAt");

CREATE INDEX IF NOT EXISTS "NewsPost_brand_views_idx"
    ON "NewsPost"("brand", "views");
