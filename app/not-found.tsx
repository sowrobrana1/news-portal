import Link from "next/link";
import { getBrand } from "@/lib/brand";

export default function NotFound() {
  const brand = getBrand();
  return (
    <div className="empty">
      <div style={{ fontSize: 64, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>৪০৪</div>
      <h1 style={{ margin: "10px 0 6px" }}>পেজটি পাওয়া যায়নি</h1>
      <p>আপনি যে পেজটি খুঁজছেন তা সরানো হয়েছে অথবা লিংকটি ভুল।</p>
      <p>
        <Link href="/" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← {brand.name}-এর প্রচ্ছদে ফিরুন
        </Link>
      </p>
    </div>
  );
}
