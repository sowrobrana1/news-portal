import type { Metadata } from "next";
import { getBrand } from "@/lib/brand";

export const metadata: Metadata = { title: "যোগাযোগ" };

export default function ContactPage() {
  const brand = getBrand();
  return (
    <div className="prose">
      <h1>যোগাযোগ</h1>
      <p>
        খবরের তথ্য পাঠাতে, কোনো প্রকাশিত খবরে ভুল থাকলে জানাতে, কিংবা বিজ্ঞাপনের জন্য —
        আমাদের Facebook পেজে বার্তা পাঠালেই সবচেয়ে দ্রুত উত্তর পাবেন।
      </p>
      <h2>Facebook পেজ</h2>
      <p>
        <a href={brand.fbPageUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>
          {brand.name} — Facebook পেজ →
        </a>
      </p>
      <h2>তথ্য পাঠান</h2>
      <p>
        আপনার এলাকার কোনো ঘটনার ছবি বা তথ্য থাকলে পেজে বার্তা পাঠান। যাচাইয়ের পর তা খবর
        হিসেবে প্রকাশ করা হবে এবং তথ্যদাতার পরিচয় গোপন রাখা হবে।
      </p>
      <h2>সংশোধনী</h2>
      <p>
        প্রকাশিত কোনো খবরে ভুল পেলে বার্তায় খবরটির লিংকসহ জানান — যাচাই করে আমরা সংশোধন
        প্রকাশ করব।
      </p>
    </div>
  );
}
