import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  const BASE = getBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
