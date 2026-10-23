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

const BN = "০১২৩৪৫৬৭৮৯";
const bn = (n: number | string) => String(n).replace(/[0-9]/g, (d) => BN[Number(d)]);

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [brand, setBrand] = useState<"pp" | "btn">("pp");
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");

  const call = useCallback(
    async (body: object, password: string) => {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify(body),
      });
      return r.json();
    },
    []
  );

  const load = useCallback(
    async (password: string, b: "pp" | "btn") => {
      const r = await call({ action: "list", brand: b }, password);
      if (r.ok) {
        setRows(r.posts);
        setAuthed(true);
        setMsg("");
        sessionStorage.setItem("np_admin_pw", password);
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
