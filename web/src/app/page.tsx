import Link from "next/link";
import { db } from "@/lib/db";
import { BRAND, PLANS, WHATSAPP_NUMBER } from "@/lib/brand";
import { EVENT_LABEL } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ ref?: string; promo?: string }> }) {
  const { ref, promo } = await searchParams;
  const portfolio = await db.invitation.findMany({
    where: { isPortfolio: true, status: { in: ["published", "archived"] } },
    orderBy: { eventAt: "desc" },
    take: 3,
  });
  const launch = await db.promoCode.findUnique({ where: { code: "LAUNCH30" } });
  const launchLeft =
    launch && launch.maxUses && (!launch.validUntil || launch.validUntil > new Date())
      ? Math.max(0, launch.maxUses - launch.usedCount)
      : 0;

  const text = [
    "Сәлеметсіз бе! Тойға шақыру жасатқым келеді.",
    promo ? `Промокод: ${promo}` : "",
    ref ? `(${ref} шақыруынан көрдім)` : "",
  ].filter(Boolean).join(" ");
  const wa = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}` : "#";

  return (
    <main className="landing">
      <header className="l-hero">
        <p className="eyebrow">{BRAND.name}</p>
        <h1>{BRAND.tagline}</h1>
        <p className="lead">Шақыру + қонақтар тізімі. Тегін алдын ала көрініс, ұнаса ғана төлейсіз.</p>
        <a className="btn big-btn" href={wa} target="_blank" rel="noopener">WhatsApp-қа жазу</a>
      </header>

      <section className="l-section">
        <h2>Не аласыз</h2>
        <ul className="features">
          <li><b>Бір батырма RSVP.</b> Қонақтар «келемін / келе алмаймын» деп жауап береді, сіз нақты санды көресіз.</li>
          <li><b>Үлкендерге арналған режим.</b> Ірі әріп, бір батырма, той иесінің дауыстық шақыруы.</li>
          <li><b>Қағаз шақыруға QR-код.</b> Қағаз шақыру қалады, жауаптар бір тізімге түседі.</li>
          <li><b>Тойханаға тізім.</b> Excel файлы, телефонмен жауап бергендерді өзіңіз қосасыз.</li>
          <li><b>24 сағатта дайын</b>, түзетулер тегін, сайт тойдан кейін 3 ай тұрады.</li>
        </ul>
      </section>

      {portfolio.length > 0 && (
        <section className="l-section">
          <h2>Мысалдар</h2>
          <div className="portfolio">
            {portfolio.map((p) => (
              <Link key={p.id} href={`/${p.slug}`} className="card">
                <span className="eyebrow">{EVENT_LABEL[p.eventType]?.kk}</span>
                <b>{p.titleKk}</b>
                <span className="muted">Ашып көру →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="l-section">
        <h2>Бағасы</h2>
        <div className="plans">
          <div className="card"><h3>{PLANS.constructor.kk}</h3><p className="price">{PLANS.constructor.price.toLocaleString("ru-RU")} ₸</p><p className="muted">Жақында</p></div>
          <div className="card featured">
            <h3>{PLANS.ready.kk}</h3>
            <p className="price">{PLANS.ready.price.toLocaleString("ru-RU")} ₸</p>
            {launchLeft > 0 && launch?.fixedPrice != null && (
              <p className="offer">Алғашқы {launch.maxUses} тапсырысқа {launch.fixedPrice.toLocaleString("ru-RU")} ₸ · {launchLeft} орын қалды</p>
            )}
            <p>Біз жасаймыз, RSVP мен тізім, еске салу, қаз/орыс</p>
          </div>
          <div className="card"><h3>{PLANS.family.kk}</h3><p className="price">{PLANS.family.price.toLocaleString("ru-RU")} ₸</p><p>Жеке дизайн, видео-шақыру, QR карточка</p></div>
        </div>
      </section>

      <section className="l-section faq">
        <h2>Сұрақтар</h2>
        <details><summary>Үлкен кісілер аша ала ма?</summary><p>Иә. Беттің басында «Үлкен әріппен көру» батырмасы бар. Ал телефонмен жауап бергендерді тізімге өзіңіз қосасыз.</p></details>
        <details><summary>Сайт қашанға дейін тұрады?</summary><p>Тойдан кейін кемінде 3 ай. Содан кейін қонақтардың деректері өшіріледі.</p></details>
        <details><summary>Ақша қайтарыла ма?</summary><p>Алдымен тегін алдын ала көрініс жібереміз. Ұнамаса, төлемейсіз. Төлегеннен кейін ұнамаса, 24 сағатта қайта жасаймыз немесе ақшаны қайтарамыз.</p></details>
      </section>

      <footer className="foot">
        <Link href="/privacy">Құпиялық саясаты</Link> · <Link href="/offer">Қоғамдық оферта</Link>
      </footer>
    </main>
  );
}
