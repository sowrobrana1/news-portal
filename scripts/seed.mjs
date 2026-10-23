#!/usr/bin/env node
/**
 * Seed the news portal with already-published Facebook posts.
 *
 * Reads the newest PER_BRAND folders from the local pipeline archives:
 *   PP  ~/workspace/news-cards/published/<post_id>/  (card.png | thumb.png,
 *        caption.txt — first line = headline, comment.txt = details body)
 *   BTN ~/workspace/btn-news/published/<id>/        (same layout)
 *
 * Two modes:
 *   A) Direct DB (default): needs DATABASE_URL in env (pooler URL).
 *        node scripts/seed.mjs
 *   B) HTTP ingest: needs INGEST_BASE (site URL) + INGEST_KEY in env.
 *        INGEST_BASE=https://prothom-prohor-news.vercel.app node scripts/seed.mjs
 *      (mode B must be run once per brand site if both are separate projects,
 *       or just use mode A — it writes both brands in one pass.)
 *
 * Dedupes on (brand, sourceFbid) — safe to re-run.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const PER_BRAND = Number(process.env.SEED_PER_BRAND || 8);
const HOME = os.homedir();

const SOURCES = [
  { brand: "pp", dir: path.join(HOME, "workspace/news-cards/published") },
  { brand: "btn", dir: path.join(HOME, "workspace/btn-news/published") },
];

function readItems({ brand, dir }) {
  if (!fs.existsSync(dir)) {
    console.log(`[${brand}] folder missing: ${dir}`);
    return [];
  }
  const folders = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const full = path.join(dir, d.name);
      return { name: d.name, full, mtime: fs.statSync(full).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);

  const items = [];
  for (const f of folders) {
    if (items.length >= PER_BRAND) break;
    const cardPng = path.join(f.full, "card.png");
    const thumbPng = path.join(f.full, "thumb.png");
    const imagePath = fs.existsSync(cardPng) ? cardPng : fs.existsSync(thumbPng) ? thumbPng : null;
    const captionPath = path.join(f.full, "caption.txt");
    if (!imagePath || !fs.existsSync(captionPath)) continue;

    const caption = fs.readFileSync(captionPath, "utf8").trim();
    const lines = caption.split("\n");
    const headline = (lines[0] || "").trim();
    if (!headline) continue;

    const commentPath = path.join(f.full, "comment.txt");
    const comment = fs.existsSync(commentPath) ? fs.readFileSync(commentPath, "utf8").trim() : "";
    const captionRest = lines.slice(1).join("\n").trim();
    const body = comment || captionRest || headline;

    items.push({
      brand,
      sourceFbid: f.name,
      headline,
      body,
      imageBase64: fs.readFileSync(imagePath).toString("base64"),
      mime: "image/png",
      publishedAt: new Date(f.mtime).toISOString(),
    });
  }
  return items;
}

async function seedViaHttp(items) {
  const base = process.env.INGEST_BASE.replace(/\/$/, "");
  const key = process.env.INGEST_KEY;
  let ok = 0;
  for (const it of items) {
    const r = await fetch(`${base}/api/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ingest-key": key },
      body: JSON.stringify(it),
    });
    const j = await r.json().catch(() => ({}));
    if (j.ok) {
      ok++;
      console.log(`[${it.brand}] ${j.deduped ? "skip (dup)" : "added"} #${j.id} — ${it.headline.slice(0, 60)}`);
    } else {
      console.log(`[${it.brand}] FAILED ${r.status} — ${it.headline.slice(0, 60)}`, j);
    }
  }
  return ok;
}

async function seedViaDb(items) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  let ok = 0;
  try {
    for (const it of items) {
      const existing = await prisma.newsPost.findUnique({
        where: { brand_sourceFbid: { brand: it.brand, sourceFbid: it.sourceFbid } },
        select: { id: true },
      });
      if (existing) {
        console.log(`[${it.brand}] skip (dup) #${existing.id} — ${it.headline.slice(0, 60)}`);
        continue;
      }
      const img = await prisma.postImage.create({
        data: { data: Buffer.from(it.imageBase64, "base64"), mime: it.mime },
        select: { id: true },
      });
      const post = await prisma.newsPost.create({
        data: {
          brand: it.brand,
          headline: it.headline,
          body: it.body,
          sourceFbid: it.sourceFbid,
          imageId: img.id,
          publishedAt: new Date(it.publishedAt),
        },
        select: { id: true },
      });
      ok++;
      console.log(`[${it.brand}] added #${post.id} — ${it.headline.slice(0, 60)}`);
    }
  } finally {
    await prisma.$disconnect();
  }
  return ok;
}

const items = SOURCES.flatMap(readItems);
console.log(`Collected ${items.length} items (${SOURCES.map((s) => s.brand).join(", ")})`);

if (process.env.INGEST_BASE && process.env.INGEST_KEY) {
  await seedViaHttp(items);
} else if (process.env.DATABASE_URL) {
  await seedViaDb(items);
} else {
  console.log("Nothing to write to: set DATABASE_URL (mode A) or INGEST_BASE + INGEST_KEY (mode B).");
  console.log("Dry-run only — items that WOULD be seeded:");
  for (const it of items) console.log(` [${it.brand}] ${it.sourceFbid} — ${it.headline.slice(0, 70)}`);
}
