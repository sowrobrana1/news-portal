// News categories — display name + URL slug.
//
// pp/btn share the original Bengali list (unchanged). sat (South Asia Today,
// English) has its own country list: Bangladesh and India are active on day
// one; Pakistan, Nepal and Sri Lanka are defined here so ingest and the
// category pages accept them, but they are NOT in the nav until flipped
// active (active: false). `active` defaults to true when omitted.

import type { BrandKey } from "./brand";

export interface Category {
  name: string;
  slug: string;
  /** False = defined but hidden from nav/home sections until day-one+1. */
  active?: boolean;
}

export const CATEGORIES: Category[] = [
  { name: "জাতীয়", slug: "jatiya" },
  { name: "রাজনীতি", slug: "rajneeti" },
  { name: "আন্তর্জাতিক", slug: "antorjatik" },
  { name: "খেলা", slug: "khela" },
  { name: "বিনোদন", slug: "binodon" },
  { name: "অর্থনীতি", slug: "orthoniti" },
  { name: "প্রযুক্তি", slug: "projukti" },
  { name: "জেলা", slug: "jela" },
];

export const SAT_CATEGORIES: Category[] = [
  { name: "Bangladesh", slug: "bangladesh", active: true },
  { name: "India", slug: "india", active: true },
  { name: "Pakistan", slug: "pakistan", active: false },
  { name: "Nepal", slug: "nepal", active: false },
  { name: "Sri Lanka", slug: "sri-lanka", active: false },
];

export const DEFAULT_CATEGORY = "জাতীয়";

/** All categories valid for a brand (including inactive sat countries). */
export function categoriesForBrand(brandKey: BrandKey): Category[] {
  return brandKey === "sat" ? SAT_CATEGORIES : CATEGORIES;
}

/** Categories shown in nav, footer and home sections for a brand. */
export function activeCategoriesForBrand(brandKey: BrandKey): Category[] {
  return categoriesForBrand(brandKey).filter((c) => c.active !== false);
}

export function defaultCategoryForBrand(brandKey: BrandKey): string {
  return brandKey === "sat" ? "Bangladesh" : DEFAULT_CATEGORY;
}

export function categoryBySlug(slug: string, brandKey?: BrandKey): Category | undefined {
  const list = brandKey ? categoriesForBrand(brandKey) : CATEGORIES;
  return list.find((c) => c.slug === slug);
}

export function categoryByName(name: string, brandKey?: BrandKey): Category | undefined {
  const list = brandKey ? categoriesForBrand(brandKey) : CATEGORIES;
  return list.find((c) => c.name === name);
}

export function slugForCategory(name: string, brandKey?: BrandKey): string {
  const found = categoryByName(name, brandKey);
  if (found) return found.slug;
  return brandKey === "sat" ? "bangladesh" : "jatiya";
}
