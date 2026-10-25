import type { Metadata } from "next";
import { getBrand } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const brand = getBrand();
  return { title: brand.lang === "en" ? "Contact" : "যোগাযোগ" };
}

export default function ContactPage() {
  const brand = getBrand();
  if (brand.lang === "en") {
    return (
      <div className="prose">
        <h1>Contact</h1>
        <p>
          To send a news tip, report an error in a published story, or enquire about advertising —
          message our Facebook page when it launches for the fastest reply.
        </p>
        <h2>Facebook page</h2>
        <p>
          {brand.fbPageUrl ? (
            <a href={brand.fbPageUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>
              {brand.name} — Facebook page →
            </a>
          ) : (
            // sat has no Facebook page yet — never link to "".
            "Facebook page coming soon."
          )}
        </p>
        <h2>Send information</h2>
        <p>
          If you have a photo or information about an event in your area, send it via the page. After
          verification it may be published as a story, and the sender&apos;s identity will be kept
          confidential.
        </p>
        <h2>Corrections</h2>
        <p>
          If you spot an error in a published story, send the story link in your message — we will
          verify it and publish a correction.
        </p>
      </div>
    );
  }
  return (
    <div className="prose">
      <h1>যোগাযোগ</h1>
      <p>
        খবরের তথ্য পাঠাতে, কোনো প্রকাশিত খবরে ভুল থাকলে জানাতে, কিংবা বিজ্ঞাপনের জন্য —
        আমাদের Facebook পেজে বার্তা পাঠালেই সবচেয়ে দ্রুত উত্তর পাবেন।
      </p>
      <h2>Facebook পেজ</h2>
      <p>
        {brand.fbPageUrl ? (
          <a href={brand.fbPageUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>
            {brand.name} — Facebook পেজ →
          </a>
        ) : (
          // sat has no Facebook page yet — never link to "".
          "Facebook পেজ শীঘ্রই আসছে।"
        )}
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
