import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { EVENT_LABEL, formatDate } from "@/lib/i18n";
import { TEMPLATES } from "@/lib/templates";
import { createInvitation, logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function Admin() {
  await requireAdmin();
  const list = await db.invitation.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { _count: { select: { rsvps: true } } } });
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const paidMonth = list.filter((i) => i.paidAt && i.paidAt >= monthStart && i.status !== "refunded");
  const revenue = paidMonth.reduce((s, i) => s + i.priceKzt, 0);
  const previews = list.filter((i) => i.status !== "draft").length;
  const paid = list.filter((i) => i.paidAt && i.status !== "refunded").length;
  const conv = previews ? Math.round((paid / previews) * 100) : 0;

  return (
    <main className="page">
      <div className="row between">
        <h1>Тапсырыстар</h1>
        <div className="row">
          <Link className="btn ghost" href="/admin/promo">Промокодтар</Link>
          <form action={logout}><button className="btn ghost">Шығу</button></form>
        </div>
      </div>

      <section className="stats">
        <div><b>{paidMonth.length}</b><span>осы айда төленді</span></div>
        <div><b>{revenue.toLocaleString("ru-RU")} ₸</b><span>осы айдағы табыс</span></div>
        <div><b>{conv}%</b><span>алдын ала көрініс → төлем</span></div>
      </section>

      <section className="card">
        <h2>Жаңа шақыру</h2>
        <form action={createInvitation} className="grid2">
          <label>Атауы (қаз.)<input name="titleKk" required placeholder="Айдос пен Аружан" /></label>
          <label>Той түрі
            <select name="eventType">{Object.entries(EVENT_LABEL).map(([k, v]) => <option key={k} value={k}>{v.kk}</option>)}</select>
          </label>
          <label>Күні мен уақыты (Алматы)<input name="eventAt" type="datetime-local" required /></label>
          <label>Клиент аты<input name="clientName" /></label>
          <label>Клиент телефоны<input name="clientPhone" type="tel" /></label>
          <div><button className="btn">Жасау</button></div>
        </form>
        <p className="muted small">Үлгілер: {TEMPLATES.map((t) => t.name).join(", ")}</p>
      </section>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Атауы</th><th>Түрі</th><th>Күні</th><th>Күйі</th><th>Жауап</th><th>Баға</th></tr></thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.id}>
                <td><Link href={`/admin/i/${i.id}`}>{i.titleKk || i.slug}</Link></td>
                <td>{EVENT_LABEL[i.eventType]?.kk}</td>
                <td>{formatDate(i.eventAt, "kk")}</td>
                <td><span className={`badge ${i.status}`}>{i.status}</span></td>
                <td>{i._count.rsvps}</td>
                <td>{i.paidAt ? `${i.priceKzt.toLocaleString("ru-RU")} ₸` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
