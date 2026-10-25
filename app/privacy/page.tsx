import type { Metadata } from "next";
import { getBrand } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const brand = getBrand();
  return { title: brand.lang === "en" ? "Privacy policy" : "গোপনীয়তা নীতি" };
}

export default function PrivacyPage() {
  const brand = getBrand();
  if (brand.lang === "en") {
    return (
      <div className="prose">
        <h1>Privacy policy</h1>
        <p>
          {brand.name} respects readers&apos; privacy. This page explains what information we collect
          and how we use it.
        </p>
        <h2>What information we collect</h2>
        <p>
          You do not need an account or any personal information to read news on this website. We may
          collect only anonymous statistics — for example, how many times a story has been read — to
          understand readers&apos; interests.
        </p>
        <h2>Cookies</h2>
        <p>
          Browser cookies may be used for the normal functioning of the site and for statistics. If
          advertising services are added in the future, the relevant provider (for example Google) may
          use cookies under its own policy.
        </p>
        <h2>Third-party links</h2>
        <p>
          Stories may link to other websites. We are not responsible for the content or privacy
          policies of those sites.
        </p>
        <h2>Changes</h2>
        <p>
          This policy may be updated when needed; any change will be announced on this page.
        </p>
      </div>
    );
  }
  return (
    <div className="prose">
      <h1>গোপনীয়তা নীতি</h1>
      <p>
        {brand.name} পাঠকের গোপনীয়তাকে সম্মান করে। এই পেজে বলা হলো আমরা কোন তথ্য সংগ্রহ করি
        এবং তা কীভাবে ব্যবহার করি।
      </p>
      <h2>কোন তথ্য সংগ্রহ করি</h2>
      <p>
        এই ওয়েবসাইটে খবর পড়তে কোনো অ্যাকাউন্ট বা ব্যক্তিগত তথ্য দিতে হয় না। আমরা শুধু
        বেনামি পরিসংখ্যান সংগ্রহ করতে পারি — যেমন কোন খবর কতবার পড়া হয়েছে — যা দিয়ে আমরা
        পাঠকের পছন্দ বুঝতে পারি।
      </p>
      <h2>কুকি</h2>
      <p>
        সাইটের স্বাভাবিক কার্যকারিতা ও পরিসংখ্যানের জন্য ব্রাউজার কুকি ব্যবহার হতে পারে।
        ভবিষ্যতে বিজ্ঞাপন সেবা যুক্ত হলে সংশ্লিষ্ট সেবাদাতা (যেমন Google) তাদের নিজস্ব নীতি
        অনুযায়ী কুকি ব্যবহার করতে পারে।
      </p>
      <h2>তৃতীয় পক্ষের লিংক</h2>
      <p>
        খবরে অন্য ওয়েবসাইটের লিংক থাকতে পারে। সেই সাইটগুলোর বিষয়বস্তু ও গোপনীয়তা নীতির
        দায় আমাদের নয়।
      </p>
      <h2>পরিবর্তন</h2>
      <p>
        প্রয়োজনে এই নীতি হালনাগাদ করা হতে পারে; পরিবর্তন হলে এই পেজেই জানানো হবে।
      </p>
    </div>
  );
}
