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

const BN = "০১২৩৪৫৬৭৮৯";
const bn = (n: number | string) => String(n).replace(/[0-9]/g, (d) => BN[Number(d)]);

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [brand, setBrand] = useState<"pp" | "btn">("pp");
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
    async (password: string, b: "pp" | "btn") => {
      const r = await call({ action: "list", brand: b }, password);
      if (r.ok) {
        setRows(r.posts);
        setAuthed(true);
        setMsg("");
        sessionStorage.setItem("np_admin_pw", password);
        const s = await call({ action: "stats", brand: b }, password);
        if (s.ok) setStats(s);
      } else {
        setAuthed(false);
        setMsg("পাসওয়ার্ড মেলেনি। আবার চেষ্টা করুন।");
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
    if (!confirm(`মুছে ফেলবেন?\n${headline}`)) return;
    const r = await call({ action: "delete", id }, pw);
    if (r.ok) load(pw, brand);
    else setMsg("মুছতে সমস্যা হয়েছে।");
  }

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setImgB64("");
      setImgName("");
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      setMsg("ছবি ৩ MB-এর বেশি বড়। ছোট ছবি দিন।");
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
      setMsg("শিরোনাম দিন।");
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
      setOkMsg(`পোস্ট হয়ে গেছে ✓ — /post/${r.id}`);
      setHeadline("");
      setBody("");
      setImgB64("");
      setImgName("");
      load(pw, brand);
    } else {
      setMsg("পোস্ট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  }

  if (!authed) {
    return (
      <div className="adminbox">
        <h1>অ্যাডমিন</h1>
        <p style={{ color: "var(--muted)" }}>চালিয়ে যেতে পাসওয়ার্ড দিন।</p>
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
            placeholder="পাসওয়ার্ড"
            autoFocus
          />
          <button className="btn" type="submit">
            ঢুকুন
          </button>
        </form>
        {msg && <p style={{ color: "#c01616" }}>{msg}</p>}
      </div>
    );
  }

  return (
    <div className="adminbox" style={{ maxWidth: 960 }}>
      <h1>খবর ব্যবস্থাপনা</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button className={brand === "pp" ? "btn" : "btn ghost"} onClick={() => { setBrand("pp"); load(pw, "pp"); }}>
          প্রথম প্রহর নিউজ
        </button>
        <button className={brand === "btn" ? "btn" : "btn ghost"} onClick={() => { setBrand("btn"); load(pw, "btn"); }}>
          BTN News
        </button>
        <span style={{ alignSelf: "center", color: "var(--muted)" }}>মোট {bn(rows.length)}টি খবর</span>
      </div>

      {stats && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
          <div style={{ flex: "1 1 140px", border: "1px solid var(--line, #ddd)", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{bn(stats.totalPosts)}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>মোট খবর</div>
          </div>
          <div style={{ flex: "1 1 140px", border: "1px solid var(--line, #ddd)", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{bn(stats.totalViews)}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>মোট পঠিত (সব খবর মিলিয়ে)</div>
          </div>
          <div style={{ flex: "1 1 140px", border: "1px solid var(--line, #ddd)", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{bn(stats.todayPosts)}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>আজকের খবর</div>
          </div>
        </div>
      )}

      {stats && stats.top.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, margin: "0 0 8px" }}>সর্বাধিক পঠিত (শীর্ষ ৫)</h2>
          <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.9 }}>
            {stats.top.map((t) => (
              <li key={t.id}>
                <a href={`/post/${t.id}`} target="_blank" rel="noreferrer">
                  {t.headline}
                </a>{" "}
                <span style={{ color: "var(--muted)" }}>— {bn(t.views)} বার পঠিত</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div style={{ border: "1px solid var(--line, #ddd)", borderRadius: 10, padding: "14px 16px", marginBottom: 22 }}>
        <h2 style={{ fontSize: 17, margin: "0 0 10px" }}>নতুন পোস্ট করুন</h2>
        <form onSubmit={createPost} style={{ display: "grid", gap: 10 }}>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="শিরোনাম"
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label style={{ alignSelf: "center" }}>
              ছবি (ঐচ্ছিক):{" "}
              <input type="file" accept="image/*" onChange={pickImage} />
              {imgName && <span style={{ color: "var(--muted)" }}> {imgName}</span>}
            </label>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="বিস্তারিত লিখুন…"
            rows={6}
            style={{ width: "100%" }}
          />
          <div>
            <button className="btn" type="submit" disabled={posting}>
              {posting ? "পোস্ট হচ্ছে…" : "পোস্ট করুন"}
            </button>
            <span style={{ marginLeft: 10, color: "var(--muted)", fontSize: 13 }}>
              পোস্ট যাবে: {brand === "pp" ? "প্রথম প্রহর নিউজ" : "BTN News"} সাইটে
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
              <th>শিরোনাম</th>
              <th>বিভাগ</th>
              <th>পঠিত</th>
              <th>সময়</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{bn(r.id)}</td>
                <td>
                  <a href={`/post/${r.id}`} target="_blank" rel="noreferrer">
                    {r.headline}
                  </a>
                </td>
                <td>{r.category}</td>
                <td>{bn(r.views)}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {new Date(r.publishedAt).toLocaleDateString("bn-BD", { timeZone: "Asia/Dhaka", day: "numeric", month: "short" })}
                </td>
                <td>
                  <button className="btn danger" onClick={() => del(r.id, r.headline)}>
                    মুছুন
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  কোনো খবর নেই
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
