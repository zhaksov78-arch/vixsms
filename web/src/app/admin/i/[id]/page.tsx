import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { EVENT_LABEL } from "@/lib/i18n";
import { TEMPLATES } from "@/lib/templates";
import { PLANS, PUBLIC_URL } from "@/lib/brand";
import { summary, type ProgramItem } from "@/lib/invitations";
import { markPaid, refund, rotateOwnerToken, saveInvitation, setStatus } from "../../actions";

export const dynamic = "force-dynamic";

// Shows a Date as "YYYY-MM-DDTHH:mm" in Almaty time (UTC+5) for datetime-local inputs.
function local(d: Date | null): string {
  if (!d) return "";
  return new Date(d.getTime() + 5 * 3600_000).toISOString().slice(0, 16);
}

export default async function Edit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const inv = await db.invitation.findUnique({ where: { id }, include: { promoCode: true } });
  if (!inv) notFound();
  const s = await summary(inv.id);
  const program = (inv.program as ProgramItem[]).map((p) => [p.time, p.textKk, p.textRu].join(" | ")).join("\n");

  const save = saveInvitation.bind(null, inv.id);
  const pay = markPaid.bind(null, inv.id);
  const doRefund = refund.bind(null, inv.id);
  const toPreview = setStatus.bind(null, inv.id, "preview");
  const toArchive = setStatus.bind(null, inv.id, "archived");
  const rotate = rotateOwnerToken.bind(null, inv.id);

  const previewUrl = `${PUBLIC_URL}/p/${inv.previewToken}`;
  const guestUrl = `${PUBLIC_URL}/${inv.slug}`;
  const ownerUrl = `${PUBLIC_URL}/manage/${inv.ownerToken}`;
  const paid = !!inv.paidAt && inv.status !== "refunded";

  return (
    <main className="page">
      <p><Link href="/admin">← Тапсырыстар</Link></p>
      <div className="row between">
        <h1>{inv.titleKk || inv.slug}</h1>
        <span className={`badge ${inv.status}`}>{inv.status}</span>
      </div>

      <section className="card links">
        <p><b>Алдын ала көрініс (клиентке):</b> <a href={previewUrl} target="_blank">{previewUrl}</a></p>
        {paid && <p><b>Қонақтарға:</b> <a href={guestUrl} target="_blank">{guestUrl}</a></p>}
        {paid && <p><b>Той иесінің панелі (құпия):</b> <a href={ownerUrl} target="_blank">{ownerUrl}</a></p>}
        {paid && <p className="muted">Қазір: {s.comingPeople} адам келеді · {s.notComing} келмейді</p>}
      </section>

      <form action={save} className="card grid2">
        <h2 className="span2">Мазмұны</h2>
        <label>Үлгі
          <select name="templateId" defaultValue={inv.templateId}>{TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        </label>
        <label>Той түрі
          <select name="eventType" defaultValue={inv.eventType}>{Object.entries(EVENT_LABEL).map(([k, v]) => <option key={k} value={k}>{v.kk}</option>)}</select>
        </label>
        <fieldset className="span2 row">
          <legend>Тілдер</legend>
          <label className="check"><input type="checkbox" name="lang_kk" defaultChecked={inv.languages.includes("kk")} /> Қазақша</label>
          <label className="check"><input type="checkbox" name="lang_ru" defaultChecked={inv.languages.includes("ru")} /> Орысша</label>
        </fieldset>
        <label>Атауы (қаз.)<input name="titleKk" defaultValue={inv.titleKk} /></label>
        <label>Атауы (орыс.)<input name="titleRu" defaultValue={inv.titleRu} /></label>
        <label>Шақыру мәтіні (қаз.)<textarea name="messageKk" rows={4} defaultValue={inv.messageKk} /></label>
        <label>Шақыру мәтіні (орыс.)<textarea name="messageRu" rows={4} defaultValue={inv.messageRu} /></label>
        <label>Той иелері (қаз.)<input name="hostsKk" defaultValue={inv.hostsKk} placeholder="Той иелері: Ерлан мен Гүлнар" /></label>
        <label>Той иелері (орыс.)<input name="hostsRu" defaultValue={inv.hostsRu} /></label>
        <label>Күні мен уақыты (Алматы)<input name="eventAt" type="datetime-local" required defaultValue={local(inv.eventAt)} /></label>
        <label>Сілтеме (slug)<input name="slug" defaultValue={inv.slug} pattern="[a-z0-9-]+" /></label>
        <label>Тойхана<input name="venueName" defaultValue={inv.venueName} /></label>
        <label>Мекенжайы<input name="venueAddress" defaultValue={inv.venueAddress} /></label>
        <label>Ендік (lat)<input name="venueLat" defaultValue={inv.venueLat ?? ""} inputMode="decimal" /></label>
        <label>Бойлық (lng)<input name="venueLng" defaultValue={inv.venueLng ?? ""} inputMode="decimal" /></label>
        <label className="span2">Бағдарлама (әр жол: уақыт | қазақша | орысша)
          <textarea name="program" rows={4} defaultValue={program} placeholder="18:00 | Қонақтарды қарсы алу | Встреча гостей" />
        </label>

        <h2 className="span2">Фото, музыка, дауыс</h2>
        <div className="span2 thumbs">
          {inv.photoIds.map((p) => (
            <label key={p} className="thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/files/${p}`} alt="" />
              <span className="check"><input type="checkbox" name="removePhoto" value={p} /> өшіру</span>
            </label>
          ))}
        </div>
        <label>Фото қосу (JPG/PNG/WebP, ≤10 МБ, барлығы ≤10)<input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple /></label>
        <label>Фондық музыка (лицензиясы бар, MP3/M4A ≤5 МБ)
          <input type="file" name="music" accept="audio/*" />
          {inv.musicFileId && <span className="check"><input type="checkbox" name="removeMusic" /> қазіргі әнді өшіру</span>}
        </label>
        <label>Дауыстық шақыру (≤60 с, ≤5 МБ)
          <input type="file" name="voice" accept="audio/*" />
          {inv.voiceFileId && <span className="check"><input type="checkbox" name="removeVoice" /> қазіргі дауысты өшіру</span>}
        </label>

        <h2 className="span2">RSVP және басқа</h2>
        <label className="check"><input type="checkbox" name="rsvpOpen" defaultChecked={inv.rsvpOpen} /> Жауап қабылдау ашық</label>
        <label>Жауап қабылдаудың соңғы мерзімі<input name="rsvpDeadline" type="datetime-local" defaultValue={local(inv.rsvpDeadline)} /></label>
        <label className="check"><input type="checkbox" name="isPortfolio" defaultChecked={inv.isPortfolio} /> Портфолиода көрсетуге клиент рұқсат берді</label>
        <label>Клиент аты<input name="clientName" defaultValue={inv.clientName} /></label>
        <label>Клиент телефоны<input name="clientPhone" defaultValue={inv.clientPhone} /></label>
        <div className="span2"><button className="btn">Сақтау</button></div>
      </form>

      {!paid && inv.status !== "refunded" && (
        <form action={pay} className="card grid2">
          <h2 className="span2">Төлем (Kaspi)</h2>
          <label>Тариф
            <select name="plan" defaultValue={inv.plan}>
              {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.kk} – {v.price.toLocaleString("ru-RU")} ₸</option>)}
            </select>
          </label>
          <label>Промокод<input name="promo" placeholder="LAUNCH30" /></label>
          <p className="span2 muted">Kaspi-де төлемнің түскенін тексергеннен кейін ғана басыңыз. Шақыру бірден жарияланады.</p>
          <div className="span2"><button className="btn">Төленді → жариялау</button></div>
        </form>
      )}

      {paid && (
        <section className="card">
          <h2>Төлем</h2>
          <p>{PLANS[inv.plan].kk}: <b>{inv.priceKzt.toLocaleString("ru-RU")} ₸</b>{inv.promoCode && ` (промокод ${inv.promoCode.code})`} · {inv.paidAt?.toLocaleString("ru-RU", { timeZone: "Asia/Almaty" })}</p>
          <div className="row">
            <form action={toArchive}><button className="btn ghost">Мұрағатқа</button></form>
            <form action={rotate}><button className="btn ghost">Той иесінің сілтемесін жаңарту</button></form>
          </div>
          <form action={doRefund} className="row">
            <input name="reason" placeholder="Ақша қайтару себебі" required />
            <button className="btn danger">Ақша қайтарылды</button>
          </form>
        </section>
      )}
      {inv.status === "refunded" && (
        <section className="card">
          <p>Ақша қайтарылды: {inv.refundReason}</p>
          <form action={toPreview}><button className="btn ghost">Алдын ала көрініске қайтару</button></form>
        </section>
      )}
    </main>
  );
}
