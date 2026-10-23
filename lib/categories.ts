// News categories — Bengali display name + URL slug.

export interface Category {
  name: string;
  slug: string;
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

export const DEFAULT_CATEGORY = "জাতীয়";

export function categoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryByName(name: string): Category | undefined {
  return CATEGORIES.find((c) => c.name === name);
}

export function slugForCategory(name: string): string {
  return categoryByName(name)?.slug || "jatiya";
}
