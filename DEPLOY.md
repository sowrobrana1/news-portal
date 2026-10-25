# Deploy — দুইটা নিউজ সাইট (প্রথম প্রহর নিউজ + BTN News)

একই কোড, দুইটা আলাদা সাইট। মোট সময় ~১৫ মিনিট, সব ফোন থেকেই হবে।

## Step 1 — Database টেবিল বানাও (একবারই)

1. Supabase খোলো → তোমার আগের project (protarok-check যেটায় আছে)
2. বামে **SQL Editor** → **New query**
3. এই ফাইলের পুরো লেখা কপি করে পেস্ট করো: `add_news_portal.sql`
4. **Run** চাপো — "Success" দেখাবে

## Step 2 — প্রথম সাইট (প্রথম প্রহর নিউজ)

1. Vercel খোলো → **Add New… → Project**
2. GitHub থেকে **news-portal** repo টা Import করো
3. Project Name দাও:

```
prothom-prohor-news
```

4. **Environment Variables**-এ এগুলো একটা একটা করে যোগ করো:

```
DATABASE_URL
```
(protarok-check-তে যেটা দিয়েছিলে হুবহু সেটাই)

```
NEXT_PUBLIC_BRAND
```
```
pp
```

```
NEXT_PUBLIC_BASE_URL
```
```
https://prothom-prohor-news.vercel.app
```

```
INGEST_KEY
```
(Muse তোমাকে যে value দিয়েছে — দুই সাইটেই একই)

```
ADMIN_PASSWORD
```
(নিজের পছন্দের একটা পাসওয়ার্ড — /admin-এ লাগবে)

5. **Deploy** চাপো

## Step 3 — দ্বিতীয় সাইট (BTN News)

আবার **Add New… → Project** → একই **news-portal** repo Import করো।
Project Name:

```
btn-news-bangla
```

Environment Variables — শুধু দুইটা বদলাবে:

```
NEXT_PUBLIC_BRAND
```
```
btn
```

```
NEXT_PUBLIC_BASE_URL
```
```
https://btn-news-bangla.vercel.app
```

বাকিগুলো (DATABASE_URL, INGEST_KEY, ADMIN_PASSWORD) Step 2-এর মতোই।
**Deploy** চাপো।

## Step 4 — পুরনো খবর সাইটে তোলা

দুইটা সাইট চালু হলে Muse-কে বলো "সাইটে পুরনো খবর তুলে দাও" —
seed script দিয়ে সর্বশেষ ৮টা করে প্রকাশিত খবর দুই সাইটে উঠে যাবে।
এরপর থেকে Facebook পেজে পোস্ট হলেই সাইটেও অটো-পোস্ট হবে (pipeline-এ
ingest যুক্ত হলে)।

## Step 5 — তৃতীয় সাইট (South Asia Today, English) — sat

আবার **Add New… → Project** → একই **news-portal** repo Import করো।

Environment Variables — শুধু এগুলো বদলাবে / যোগ হবে:

```
NEXT_PUBLIC_BRAND
```
```
sat
```

```
NEXT_PUBLIC_BASE_URL
```
```
https://<new-sat-vercel-project>.vercel.app
```
(প্রজেক্ট বানানোর পর আসল URL এখানে বসাতে হবে)

```
NEXT_PUBLIC_ADSTERRA_CODE
```
(ঐচ্ছিক, এখনই লাগবে না — Adsterra অ্যাকাউন্ট হলে তবেই বসাবে; না থাকলে
সাইটে কোনো অ্যাড দেখাবে না, শুধু dev-এ placeholder দেখাবে)

বাকিগুলো (DATABASE_URL, INGEST_KEY, ADMIN_PASSWORD) Step 2-এর মতোই।
GA id আর Facebook পেজ এখনো নেই — সেগুলো পরে বসালে কোড বদলাতে হবে না,
শুধু sat ব্র্যান্ডের gaId/fbPageUrl আপডেট করতে হবে। Search Console-এর
token-ও sat-এর জন্য আলাদা করে নিতে হবে (layout-এ pp/btn-এর token reuse
করা আছে, সেটা sat-এর property verify করবে না)।

Ingest: `python3 ingest_item.py sat <published_folder>` — brand "sat",
category "Bangladesh"/"India" (পরে Pakistan/Nepal/Sri Lanka)।

## পরে কাস্টম ডোমেইন

পেজ ভাইরাল হলে ডোমেইন কিনে Vercel → Project → Settings → Domains থেকে
যোগ করা যাবে, আর `NEXT_PUBLIC_BASE_URL` বদলে নতুন ডোমেইন বসাতে হবে।
কোড বদলাতে হবে না।
