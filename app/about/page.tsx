import type { Metadata } from "next";
import { getBrand } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const brand = getBrand();
  return { title: brand.lang === "en" ? "About us" : "আমাদের সম্পর্কে" };
}

export default function AboutPage() {
  const brand = getBrand();
  if (brand.lang === "en") {
    return (
      <div className="prose">
        <h1>About us</h1>
        <p>
          <b>{brand.name}</b> is an independent English-language online news outlet covering South Asia.{" "}
          {brand.tagline} — on that promise, we verify important events from the region every day and
          bring them to readers quickly and accurately.
        </p>
        <h2>How we work</h2>
        <p>
          Before publication, we check every story against more than one reliable source. We do not
          publish rumours or false information; if an error is found in a published story, we correct
          it and tell readers.
        </p>
        <h2>What you will find</h2>
        <p>
          Bangladesh, India, Pakistan, Nepal, Sri Lanka and the wider South Asia region — politics,
          business, sport, culture and more — in one place, in a mobile-friendly, easy-to-read design.
        </p>
        <p>
          Follow our Facebook page when it launches — daily updates will be shared there too.
        </p>
      </div>
    );
  }
  return (
    <div className="prose">
      <h1>আমাদের সম্পর্কে</h1>
      <p>
        <b>{brand.name}</b> একটি স্বাধীন বাংলা অনলাইন সংবাদ মাধ্যম। {brand.tagline} — এই অঙ্গীকার
        নিয়ে আমরা প্রতিদিন দেশ-বিদেশের গুরুত্বপূর্ণ ঘটনা যাচাই করে দ্রুত ও নির্ভুলভাবে পাঠকের
        কাছে পৌঁছে দিই।
      </p>
      <h2>আমাদের কাজের ধরন</h2>
      <p>
        প্রতিটি খবর প্রকাশের আগে আমরা একাধিক নির্ভরযোগ্য সূত্রে তথ্য যাচাই করি। গুজব ও
        অসত্য তথ্য আমরা প্রকাশ করি না; কোনো খবরে ভুল পাওয়া গেলে তা সংশোধন করে পাঠককে জানিয়ে
        দেওয়া হয়।
      </p>
      <h2>যা যা পাবেন</h2>
      <p>
        জাতীয়, রাজনীতি, আন্তর্জাতিক, খেলা, বিনোদন, অর্থনীতি, প্রযুক্তি ও জেলা পর্যায়ের খবর —
        সবই এক ঠিকানায়, মোবাইল-বান্ধব সহজ নকশায়।
      </p>
      <p>
        আমাদের Facebook পেজেও যুক্ত থাকুন — সেখানেও প্রতিদিনের সব আপডেট পাবেন।
      </p>
    </div>
  );
}
