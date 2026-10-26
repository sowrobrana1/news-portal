// Adsterra banner ad slot (South Asia Today monetization).
//
// The approved Adsterra banner unit for south-asia-today.vercel.app
// (300x250, key 08765e663e0a041cbb22e95c17a280fc) is injected here.
// Brand-gated: it renders ONLY on the sat deployment
// (NEXT_PUBLIC_BRAND=sat), so the PP and BTN sites sharing this
// codebase never serve this unit.
//
// Slots: "header" (below the masthead, used in layout) and "article"
// (inside article pages, after the body text).

"use client";

import { useEffect, useRef } from "react";

export type AdSlotName = "header" | "article";

const ADSTERRA_KEY = "08765e663e0a041cbb22e95c17a280fc";

export default function AdSlot({ slot }: { slot: AdSlotName }) {
  const ref = useRef<HTMLDivElement>(null);
  const brand = (process.env.NEXT_PUBLIC_BRAND || "pp").toLowerCase();

  useEffect(() => {
    if (brand !== "sat" || !ref.current) return;
    const container = ref.current;
    const config = document.createElement("script");
    config.text = `atOptions = { 'key' : '${ADSTERRA_KEY}', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };`;
    const invoke = document.createElement("script");
    invoke.src = `https://bauval.org/22/${ADSTERRA_KEY}`;
    invoke.async = true;
    container.appendChild(config);
    container.appendChild(invoke);
    return () => {
      container.innerHTML = "";
    };
  }, [brand]);

  if (brand !== "sat") return null;
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
