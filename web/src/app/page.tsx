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
        <div className="l-hero-text">
        <p className="eyebrow">{BRAND.name}</p>
        <h1>{BRAND.tagline}</h1>
        <p className="lead">Біз шақыру сайтын жасаймыз, қонақтарыңыз бір батырмамен жауап береді, ал сіз тойханаға нақты санды айтасыз. Алдымен тегін көріп шығасыз, ұнаса ғана төлейсіз.</p>
        <a className="btn big-btn" href={wa} target="_blank" rel="noopener">WhatsApp-қа жазу</a>
        </div>
        {portfolio[0] && (
          <div className="phone" aria-label="Мысал шақыру">
            <iframe src={`/${portfolio[0].slug}`} title={`Мысал шақыру: ${portfolio[0].titleKk}`} loading="lazy" />
          </div>
        )}
      </header>

      <section className="l-section">
        <h2>Не аласыз</h2>
        <ul className="features">
          <li><Icon name="users" />Қонақ «Келемін» немесе «Келе алмаймын» батырмасын басады. Сіз кімнің және қанша адамның келетінін тізімнен көресіз.</li>
          <li><Icon name="type" />Апаңыз «Үлкен әріппен көру» батырмасын басып, шақыруды ірі әріппен оқиды. Сіздің дауыстық шақыруыңызды да тыңдай алады.</li>
          <li><Icon name="qr" />Қағаз шақыруға QR-код басасыз. Қонақ оны телефонмен сканерлеп жауап береді, ал сіз оның жауабын сол тізімнен көресіз.</li>
          <li><Icon name="sheet" />Тойханаға Excel тізімін бір батырмамен жүктейсіз. Телефон соғып айтқан туыстарды тізімге өзіңіз қосасыз.</li>
          <li><Icon name="clock" />Біз шақыруды 24 сағатта жасаймыз, ал тойға дейінгі түзетулерге ақы алмаймыз. Сайтты тойдан кейін 3 ай ашық ұстаймыз.</li>
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
            <p>Шақыруды біз жасаймыз. Ішінде жауап батырмасы, қонақтар тізімі және еске салу хабарламасы бар, қазақша да, орысша да.</p>
          </div>
          <div className="card"><h3>{PLANS.family.kk}</h3><p className="price">{PLANS.family.price.toLocaleString("ru-RU")} ₸</p><p>Дизайнды сізге арнап саламыз, видео-шақыру мен қағазға басатын QR карточканы қосамыз.</p></div>
        </div>
      </section>

      <section className="l-section faq">
        <h2>Сұрақтар</h2>
        <details><summary>Үлкен кісілер аша ала ма?</summary><p>Иә, беттің басындағы «Үлкен әріппен көру» батырмасын бассаңыз болды. Телефонмен жауап берген ақсақалдарды тізімге өзіңіз қосасыз.</p></details>
        <details><summary>Сайт қашанға дейін тұрады?</summary><p>Тойдан кейін кемінде 3 ай. Содан соң біз қонақтардың аты мен телефонын өшіреміз.</p></details>
        <details><summary>Ақша қайтарыла ма?</summary><p>Алдымен тегін алдын ала көрініс жібереміз. Ұнамаса, төлемейсіз. Төлегеннен кейін ұнамаса, 24 сағатта қайта жасаймыз немесе ақшаны қайтарамыз.</p></details>
      </section>

      <footer className="foot">
        <Link href="/privacy">Құпиялық саясаты</Link> · <Link href="/offer">Қоғамдық оферта</Link>
      </footer>
    </main>
  );
}

// Lucide icon paths (ISC licence), inlined so the page needs no icon package.
const ICONS: Record<string, string[]> = {
  users: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75", "M9 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8"],
  type: ["M4 7V4h16v3", "M9 20h6", "M12 4v16"],
  qr: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h3v3h-3z", "M21 14v.01", "M17 21h4v-4", "M14 21v.01"],
  sheet: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M8 13h8", "M8 17h8"],
  clock: ["M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20", "M12 6v6l4 2"],
};
function Icon({ name }: { name: string }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
