"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  name: string;
  attending: boolean;
  guestsCount: number;
  phone: string | null;
  wish: string | null;
  source: "link" | "qr" | "manual";
  createdAt: string;
};
type Data = { summary: { comingPeople: number; comingAnswers: number; notComing: number }; rows: Row[]; piiErased: boolean };

const SRC = { link: "Сілтеме", qr: "QR", manual: "Қолмен" } as const;

export default function OwnerPanel({ token, title, when, link, reminder }: { token: string; title: string; when: string; link: string; reminder: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "yes" | "no" | "manual">("all");
  const [copied, setCopied] = useState("");
  const base = `/api/manage/${token}`;

  const load = useCallback(async () => {
    const r = await fetch(base, { cache: "no-store" });
    if (r.ok) setData(await r.json());
  }, [base]);

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  const rows = useMemo(() => {
    let r = data?.rows ?? [];
    if (filter === "yes") r = r.filter((x) => x.attending);
    if (filter === "no") r = r.filter((x) => !x.attending);
    if (filter === "manual") r = r.filter((x) => x.source === "manual");
    if (q.trim()) r = r.filter((x) => x.name.toLowerCase().includes(q.trim().toLowerCase()));
    return r;
  }, [data, q, filter]);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const res = await fetch(`${base}/rsvp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: f.get("name"),
        attending: f.get("attending") === "yes",
        guestsCount: Number(f.get("guestsCount") || 1),
        phone: f.get("phone") || null,
      }),
    });
    if (res.ok) {
      form.reset();
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Өшіру керек пе?")) return;
    await fetch(`${base}/rsvp/${id}`, { method: "DELETE" });
    load();
  }

  async function changeCount(r: Row) {
    const v = prompt("Адам саны", String(r.guestsCount));
    if (!v) return;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 30) return;
    await fetch(`${base}/rsvp/${r.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ guestsCount: n }) });
    load();
  }

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 2000);
    } catch {}
  }

  const s = data?.summary;
  return (
    <main className="page owner">
      <h1>{title}</h1>
      <p className="muted">{when}</p>

      <section className="stats">
        <div><b>{s?.comingPeople ?? "…"}</b><span>адам келеді</span></div>
        <div><b>{s?.comingAnswers ?? "…"}</b><span>жауап «келемін»</span></div>
        <div><b>{s?.notComing ?? "…"}</b><span>келмейді</span></div>
      </section>

      <section className="card tools">
        <a className="btn" href={`${base}/export`}>Excel жүктеу</a>
        <a className="btn ghost" href={`${base}/qr`}>QR (PNG)</a>
        <a className="btn ghost" href={`${base}/qr?format=svg`}>QR (SVG)</a>
        <button className="btn ghost" onClick={() => copy(link, "link")}>{copied === "link" ? "Көшірілді ✓" : "Шақыру сілтемесі"}</button>
        <button className="btn ghost" onClick={() => copy(reminder, "rem")}>{copied === "rem" ? "Көшірілді ✓" : "Еске салу мәтіні"}</button>
        <a className="btn ghost" href={`https://wa.me/?text=${encodeURIComponent(reminder)}`} target="_blank" rel="noopener">WhatsApp-қа жіберу</a>
      </section>

      <section className="card">
        <h2>Телефонмен жауап бергенді қосу</h2>
        <form className="addrow" onSubmit={add}>
          <input name="name" placeholder="Аты-жөні" aria-label="Аты-жөні" required maxLength={80} />
          <select name="attending" defaultValue="yes" aria-label="Жауабы">
            <option value="yes">Келеді</option>
            <option value="no">Келмейді</option>
          </select>
          <input name="guestsCount" type="number" min={1} max={30} defaultValue={1} aria-label="Адам саны" />
          <input name="phone" type="tel" placeholder="Телефон" aria-label="Телефон" maxLength={20} />
          <button className="btn">Қосу</button>
        </form>
      </section>

      <section className="card">
        <div className="filters">
          <input placeholder="Іздеу…" aria-label="Аты бойынша іздеу" value={q} onChange={(e) => setQ(e.target.value)} />
          {(["all", "yes", "no", "manual"] as const).map((k) => (
            <button key={k} className={`pill ${filter === k ? "on" : ""}`} onClick={() => setFilter(k)}>
              {{ all: "Барлығы", yes: "Келеді", no: "Келмейді", manual: "Қолмен" }[k]}
            </button>
          ))}
        </div>
        {data?.piiErased && <p className="muted">Той өткеніне 90 күн болды, сондықтан біз қонақтардың аты мен телефонын өшірдік.</p>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Аты-жөні</th><th>Саны</th><th>Жауабы</th><th>Телефон</th><th>Арна</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td data-label="Аты-жөні">{r.name}{r.wish && <div className="muted small">{r.wish}</div>}</td>
                  <td data-label="Саны"><button className="link" onClick={() => changeCount(r)}>{r.attending ? r.guestsCount : "—"}</button></td>
                  <td data-label="Жауабы"><span className={`badge ${r.attending ? "published" : "refunded"}`}>{r.attending ? "Келеді" : "Келмейді"}</span></td>
                  <td data-label="Телефон">{r.phone ?? ""}</td>
                  <td data-label="Арна">{SRC[r.source]}</td>
                  <td><button className="link danger" onClick={() => remove(r.id)}>Өшіру</button></td>
                </tr>
              ))}
              {data && rows.length === 0 && <tr><td colSpan={6} className="muted">Әзірге жауап жоқ</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
