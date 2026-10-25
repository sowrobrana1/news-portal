// Brand is chosen per deployment by NEXT_PUBLIC_BRAND=pp|btn|sat.
// The sites share this codebase and database but look fully separate.
// pp/btn are Bengali; sat (South Asia Today) is English.

export type BrandKey = "pp" | "btn" | "sat";

export interface Brand {
  key: BrandKey;
  name: string;
  nameEn: string;
  tagline: string;
  description: string;
  fbPageUrl: string;
  themeColor: string;
  // Google Analytics 4 Measurement ID ("" = analytics off for this brand).
  gaId: string;
  // UI language for this brand's chrome (article bodies are stored as-is).
  lang: "bn" | "en";
  locale: string;
}

export const BRANDS: Record<BrandKey, Brand> = {
  pp: {
    key: "pp",
    name: "প্রথম প্রহর নিউজ",
    nameEn: "Prothom Prohor News",
    tagline: "সবার আগে, সত্য খবর",
    description:
      "প্রথম প্রহর নিউজ — দেশ-বিদেশের সর্বশেষ খবর সবার আগে। রাজনীতি, খেলা, অর্থনীতি, বিনোদনসহ সব আপডেট এক ঠিকানায়।",
    fbPageUrl: "https://www.facebook.com/profile.php?id=61580723216967",
    themeColor: "#0c0c0f",
    gaId: "G-6SG6Q0DT5B",
    lang: "bn",
    locale: "bn_BD",
  },
  btn: {
    key: "btn",
    name: "BTN News",
    nameEn: "BTN News",
    tagline: "বাংলা টেলিভিশন নেটওয়ার্ক",
    description:
      "BTN News — বাংলা টেলিভিশন নেটওয়ার্ক। দেশজুড়ে ঘটে যাওয়া গুরুত্বপূর্ণ সব খবর ও ব্রেকিং আপডেট সবার আগে।",
    fbPageUrl: "https://www.facebook.com/profile.php?id=61595222201559",
    themeColor: "#081527",
    gaId: "G-LSLLKTZ83C",
    lang: "bn",
    locale: "bn_BD",
  },
  sat: {
    key: "sat",
    name: "South Asia Today",
    nameEn: "South Asia Today",
    tagline: "South Asia news, in English, every day",
    description:
      "South Asia Today — English-language news from Bangladesh, India, Pakistan, Nepal, Sri Lanka and the wider South Asia region, for readers in the United States and the South Asian diaspora worldwide.",
    // No Facebook page yet — leave blank until one is created; layout
    // hides the Facebook link when this is empty (it must not link to "").
    fbPageUrl: "",
    // Distinct professional teal (pp = near-black/red, btn = navy/red).
    themeColor: "#0f766e",
    // No GA id yet — set one in the sat Vercel project when ready.
    gaId: "",
    lang: "en",
    locale: "en_US",
  },
};

export function getBrand(): Brand {
  const key = (process.env.NEXT_PUBLIC_BRAND || "pp").toLowerCase();
  if (key === "btn") return BRANDS.btn;
  if (key === "sat") return BRANDS.sat;
  return BRANDS.pp;
}

export function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
}
