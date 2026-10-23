"use client";

import { useState } from "react";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="sharebar">
      <span>শেয়ার করুন:</span>
      <a className="sharebtn fb" href={fb} target="_blank" rel="noreferrer">
        Facebook
      </a>
      <a className="sharebtn wa" href={wa} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <button className="sharebtn" onClick={copy} type="button">
        {copied ? "✓ কপি হয়েছে" : "🔗 লিংক কপি"}
      </button>
    </div>
  );
}
