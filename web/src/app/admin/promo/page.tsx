import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createPromo } from "../actions";

export const dynamic = "force-dynamic";

export default async function Promo() {
  await requireAdmin();
  const codes = await db.promoCode.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { invitations: true } } } });
  return (
    <main className="page">
      <p><Link href="/admin">← Тапсырыстар</Link></p>
      <h1>Промокодтар</h1>
      <section className="card">
        <form action={createPromo} className="grid2">
          <label>Код<input name="code" required placeholder="ASABA-ERLAN" /></label>
          <label>Түрі<select name="kind"><option value="discount">Жеңілдік</option><option value="partner">Серіктес (асаба, тойхана)</option></select></label>
          <label>Тұрақты баға, ₸ (Дайын шақыру үшін)<input name="fixedPrice" type="number" min={0} /></label>
          <label>Жеңілдік, ₸<input name="discountKzt" type="number" min={0} /></label>
          <label>Серіктес аты<input name="partnerName" /></label>
          <label>Ең көп қолдану<input name="maxUses" type="number" min={1} /></label>
          <label>Мерзімі (қоса алғанда)<input name="validUntil" type="date" /></label>
          <div><button className="btn">Қосу</button></div>
        </form>
      </section>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Код</th><th>Түрі</th><th>Баға / жеңілдік</th><th>Серіктес</th><th>Қолданылды</th><th>Мерзімі</th></tr></thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id}>
                <td><b>{c.code}</b></td>
                <td>{c.kind}</td>
                <td>{c.fixedPrice != null ? `${c.fixedPrice} ₸` : c.discountKzt ? `−${c.discountKzt} ₸` : "—"}</td>
                <td>{c.partnerName ?? ""}</td>
                <td>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                <td>{c.validUntil?.toLocaleDateString("ru-RU", { timeZone: "Asia/Almaty" }) ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
