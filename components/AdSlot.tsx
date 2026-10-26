// Adsterra banner ad slots (one approved unit per site).
//
// Approved 300x250 banner units, each rendered ONLY on its own brand's
// deployment (NEXT_PUBLIC_BRAND) — never cross-served:
//   sat: south-asia-today.vercel.app, key 08765e663e0a041cbb22e95c17a280fc
//   pp:  prothom-prohor-news.vercel.app, key ee6ae52e3d9f773f1b4a29637e1b5ae3
//   btn: btn-news-bangla.vercel.app, key 2df0d297296eabcde005d5decbb70f92
//
// Slots: "header" (below the masthead, used in layout) and "article"
// (inside article pages, after the body text).

"use client";

import { useEffect, useRef } from "react";

export type AdSlotName = "header" | "article";

const ADSTERRA_KEYS: Record<string, string> = {
  sat: "08765e663e0a041cbb22e95c17a280fc",
  pp: "ee6ae52e3d9f773f1b4a29637e1b5ae3",
  btn: "2df0d297296eabcde005d5decbb70f92",
};

export default function AdSlot({ slot }: { slot: AdSlotName }) {
  const ref = useRef<HTMLDivElement>(null);
  const brand = (process.env.NEXT_PUBLIC_BRAND || "pp").toLowerCase();
  const key = ADSTERRA_KEYS[brand];

  useEffect(() => {
    if (!key || !ref.current) return;
    const container = ref.current;
    const config = document.createElement("script");
    config.text = `atOptions = { 'key' : '${key}', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };`;
    const invoke = document.createElement("script");
    invoke.src = `https://bauval.org/22/${key}`;
    invoke.async = true;
    container.appendChild(config);
    container.appendChild(invoke);
    return () => {
      container.innerHTML = "";
    };
  }, [brand, key]);

  if (!key) return null;
  return (
    <div
      ref={ref}
      className="ad-slot"
      data-ad-slot={slot}
      style={{ display: "flex", justifyContent: "center", margin: "1rem 0" }}
      aria-hidden="true"
    />
  );
}
