// Adsterra ad-slot placeholder (South Asia Today monetization, step 1).
//
// No real Adsterra publisher code exists yet, and none is invented here.
// - If NEXT_PUBLIC_ADSTERRA_CODE is unset: renders nothing in production,
//   and a clearly marked dashed placeholder in development only, so the
//   slot position can be checked without serving a fake ad.
// - If the env var IS set: renders only a container div tagged with the
//   slot name. The real Adsterra script snippet still has to be pasted into
//   this single component (follow-up, after Adsterra approves the sat site)
//   — do not paste any script here until then, and never hard-code a key.
//
// Slots: "header" (below the masthead, used in layout) and "article"
// (inside article pages, after the body text).

export type AdSlotName = "header" | "article";

export default function AdSlot({ slot }: { slot: AdSlotName }) {
  const code = process.env.NEXT_PUBLIC_ADSTERRA_CODE || "";
  if (!code) {
    if (process.env.NODE_ENV !== "production") {
      return (
        <div className="ad-slot-placeholder" aria-hidden="true">
          Adsterra ad slot ({slot}) — set NEXT_PUBLIC_ADSTERRA_CODE
        </div>
      );
    }
    return null;
  }
  // Code is configured but no vendor script is wired yet (see header above).
  return <div className="ad-slot" data-ad-slot={slot} aria-hidden="true" />;
}
