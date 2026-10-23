// Brand is chosen per deployment by NEXT_PUBLIC_BRAND=pp|btn.
// The two sites share this codebase and database but look fully separate.

export type BrandKey = "pp" | "btn";

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
    gaId: "",
  },
};

export function getBrand(): Brand {
  const key = (process.env.NEXT_PUBLIC_BRAND || "pp").toLowerCase();
  return key === "btn" ? BRANDS.btn : BRANDS.pp;
}

export function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
}
