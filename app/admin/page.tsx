"use client";

import { useCallback, useEffect, useState } from "react";

interface Row {
  id: number;
  headline: string;
  category: string;
  views: number;
  publishedAt: string;
  sourceFbid: string;
}

interface Stats {
  totalPosts: number;
  totalViews: number;
  todayPosts: number;
  top: { id: number; headline: string; views: number }[];
}

const CATS = ["জাতীয়", "রাজনীতি", "আন্তর্জাতিক", "খেলা", "বিনোদন", "অর্থনীতি", "প্রযুক্তি", "জেলা"];
const CATS_BY_BRAND: Record<"pp" | "btn" | "sat", string[]> = {
  pp: CATS,
  btn: CATS,
  sat: ["Bangladesh", "India", "Pakistan", "Nepal", "Sri Lanka"],
};

const BN = "০১২৩৪৫৬৭৮৯";
const bn = (n: number | string) => String(n).replace(/[0-9]/g, (d) => BN[Number(d)]);

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [brand, setBrand] = useState<"pp" | "btn" | "sat">("pp");
  // Admin UI language follows the brand being managed: sat is English,
  // pp/btn stay Bangla. Headlines/bodies themselves are never translated.
  const isSat = brand === "sat";
  const num = (n: number | string) => (isSat ? String(n) : bn(n));
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [msg, setMsg] = useState("");

  // New-post form state
  const [headline, setHeadline] = useState("");
  const [category, setCategory] = useState(CATS[0]);
  const [body, setBody] = useState("");
  const [imgB64, setImgB64] = useState<string>("");
  const [imgMime, setImgMime] = useState<string>("image/png");
  const [imgName, setImgName] = useState<string>("");
  const [posting, setPosting] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  const call = useCallback(async (payload: object, password: string) => {
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(payload),
    });
    return r.json();
  }, []);

  const load = useCallback(
    async (password: string, b: "pp" | "btn" | "sat") => {
      const r = await call({ action: "list", brand: b }, password);
      if (r.ok) {
        setRows(r.posts);
        setAuthed(true);
        setMsg("");
        sessionStorage.setItem("np_admin_pw", password);
        // Mark this browser as admin so the admin's own article visits are
        // not counted in the পঠিত (views) numbers.
        document.cookie = "np_admin=1; path=/; max-age=31536000; SameSite=Lax";
        const s = await call({ action: "stats", brand: b }, password);
        if (s.ok) setStats(s);
      } else {
        setAuthed(false);
        // Use the brand being loaded (b), not the state brand, which may
        // not have updated yet when switching brands.
        setMsg(b === "sat" ? "Password did not match. Try again." : "পাসওয়ার্ড মেলেনি। আবার চেষ্টা করুন।");
      }
    },
    [call]
  );

  useEffect(() => {
    const saved = sessionStorage.getItem("np_admin_pw");
    if (saved) {
      setPw(saved);
      load(saved, brand);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function del(id: number, headline: string) {
    if (!confirm(isSat ? `Delete?\n${headline}` : `মুছে ফেলবেন?\n${headline}`)) return;
    const r = await call({ action: "delete", id }, pw);
    if (r.ok) load(pw, brand);
    else setMsg(isSat ? "There was a problem deleting." : "মুছতে সমস্যা হয়েছে।");
  }

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setImgB64("");
      setImgName("");
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      setMsg(isSat ? "Image is larger than 3 MB. Please use a smaller image." : "ছবি ৩ MB-এর বেশি বড়। ছোট ছবি দিন।");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result || "");
      const comma = s.indexOf(",");
      setImgB64(comma >= 0 ? s.slice(comma + 1) : s);
      setImgMime(f.type || "image/png");
      setImgName(f.name);
    };
    reader.readAsDataURL(f);
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    if (!headline.trim()) {
      setMsg(isSat ? "Enter a headline." : "শিরোনাম দিন।");
      return;
    }
    setPosting(true);
    setOkMsg("");
    setMsg("");
    const payload: any = { action: "create", brand, headline, category, body };
    if (imgB64) {
      payload.imageBase64 = imgB64;
      payload.mime = imgMime;
    }
    const r = await call(payload, pw);
    setPosting(false);
    if (r.ok) {
      setOkMsg(isSat ? `Posted ✓ — /post/${r.id}` : `পোস্ট হয়ে গেছে ✓ — /post/${r.id}`);
      setHeadline("");
      setBody("");
      setImgB64("");
      setImgName("");
      load(pw, brand);
    } else {
      setMsg(isSat ? "There was a problem posting. Try again." : "পোস্ট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  }

  if (!authed) {
    return (
      <div className="adminbox">
        <h1>{isSat ? "Admin" : "অ্যাডমিন"}</h1>
        <p style={{ color: "var(--muted)" }}>{isSat ? "Enter your password to continue." : "চালিয়ে যেতে পাসওয়ার্ড দিন।"}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(pw, brand);
          }}
          style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder={isSat ? "Password" : "পাসওয়ার্ড"}
            autoFocus
          />
          <button className="btn" type="submit">
            {isSat ? "Sign in" : "ঢুকুন"}
          </button>
        </form>
        {msg && <p style={{ color: "#c01616" }}>{msg}</p>}
      </div>
    );
  }

  return (
    <div className="adminbox" style={{ maxWidth: 960 }}>
      <h1>{isSat ? "News management" : "খবর ব্যবস্থাপনা"}</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button className={brand === "pp" ? "btn" : "btn ghost"} onClick={() => { setBrand("pp"); load(pw, "pp"); }}>
          প্রথম প্রহর নিউজ
        </button>
        <button className={brand === "btn" ? "btn" : "btn ghost"} onClick={() => { setBrand("btn"); load(pw, "btn"); }}>
          BTN News
        </button>
        <button className={brand === "sat" ? "btn" : "btn ghost"} onClick={() => { setBrand("sat"); setCategory(CATS_BY_BRAND.sat[0]); load(pw, "sat"); }}>
          South Asia Today
        </button>
        <span style={{ alignSelf: "center", color: "var(--muted)" }}>
          {isSat ? `Total ${rows.length} news` : `মোট ${bn(rows.length)}টি খবর`}
        </span>
      </div>

      {stats && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
          <div style={{ flex: "1 1 140px", border: "1px solid var(--line, #ddd)", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{num(stats.totalPosts)}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>{isSat ? "Total news" : "মোট খবর"}</div>
          </div>
          <div style={{ flex: "1 1 140px", border: "1px solid var(--line, #ddd)", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{num(stats.totalViews)}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>{isSat ? "Total reads (all news)" : "মোট পঠিত (সব খবর মিলিয়ে)"}</div>
          </div>
          <div style={{ flex: "1 1 140px", border: "1px solid var(--line, #ddd)", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{num(stats.todayPosts)}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>{isSat ? "Today's news" : "আজকের খবর"}</div>
          </div>
        </div>
      )}

      {stats && stats.top.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, margin: "0 0 8px" }}>{isSat ? "Most read (top 5)" : "সর্বাধিক পঠিত (শীর্ষ ৫)"}</h2>
          <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.9 }}>
            {stats.top.map((t) => (
              <li key={t.id}>
                <a href={`/post/${t.id}`} target="_blank" rel="noreferrer">
                  {t.headline}
                </a>{" "}
                <span style={{ color: "var(--muted)" }}>
                  {isSat ? `— ${t.views} reads` : `— ${bn(t.views)} বার পঠিত`}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div style={{ border: "1px solid var(--line, #ddd)", borderRadius: 10, padding: "14px 16px", marginBottom: 22 }}>
        <h2 style={{ fontSize: 17, margin: "0 0 10px" }}>{isSat ? "Create a new post" : "নতুন পোস্ট করুন"}</h2>
        <form onSubmit={createPost} style={{ display: "grid", gap: 10 }}>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={isSat ? "Headline" : "শিরোনাম"}
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATS_BY_BRAND[brand].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label style={{ alignSelf: "center" }}>
              {isSat ? "Image (optional):" : "ছবি (ঐচ্ছিক):"}{" "}
              <input type="file" accept="image/*" onChange={pickImage} />
              {imgName && <span style={{ color: "var(--muted)" }}> {imgName}</span>}
            </label>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={isSat ? "Write the details…" : "বিস্তারিত লিখুন…"}
            rows={6}
            style={{ width: "100%" }}
          />
          <div>
            <button className="btn" type="submit" disabled={posting}>
              {posting ? (isSat ? "Posting…" : "পোস্ট হচ্ছে…") : isSat ? "Post" : "পোস্ট করুন"}
            </button>
            <span style={{ marginLeft: 10, color: "var(--muted)", fontSize: 13 }}>
              {isSat ? "Will post to: " : "পোস্ট যাবে: "}
              {brand === "pp" ? "প্রথম প্রহর নিউজ" : brand === "btn" ? "BTN News" : "South Asia Today"}
              {isSat ? " site" : " সাইটে"}
            </span>
          </div>
        </form>
        {okMsg && <p style={{ color: "#0a7d2c" }}>{okMsg}</p>}
      </div>

      {msg && <p style={{ color: "#c01616" }}>{msg}</p>}
      <div style={{ overflowX: "auto" }}>
        <table className="admin">
          <thead>
            <tr>
              <th>#</th>
              <th>{isSat ? "Headline" : "শিরোনাম"}</th>
              <th>{isSat ? "Category" : "বিভাগ"}</th>
              <th>{isSat ? "Reads" : "পঠিত"}</th>
              <th>{isSat ? "Time" : "সময়"}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{num(r.id)}</td>
                <td>
                  <a href={`/post/${r.id}`} target="_blank" rel="noreferrer">
                    {r.headline}
                  </a>
                </td>
                <td>{r.category}</td>
                <td>{num(r.views)}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {new Date(r.publishedAt).toLocaleDateString(isSat ? "en-US" : "bn-BD", { timeZone: "Asia/Dhaka", day: "numeric", month: "short" })}
                </td>
                <td>
                  <button className="btn danger" onClick={() => del(r.id, r.headline)}>
                    {isSat ? "Delete" : "মুছুন"}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  {isSat ? "No news yet" : "কোনো খবর নেই"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
