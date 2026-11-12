import { existsSync } from "fs";
import path from "path";
import Link from "next/link";
import { db } from "@/lib/db";
import { BRAND, PLANS, WHATSAPP_NUMBER } from "@/lib/brand";
import { TEMPLATES } from "@/lib/templates";

export const dynamic = "force-dynamic";

// Drop a photo you have the rights to at web/public/hero.jpg and it replaces the live phone preview.
const HERO_PHOTO = existsSync(path.join(process.cwd(), "public", "hero.jpg"));

export default async function Home({ searchParams }: { searchParams: Promise<{ ref?: string; promo?: string }> }) {
  const { ref, promo } = await searchParams;
  const portfolio = await db.invitation.findMany({
    where: { isPortfolio: true, status: { in: ["published", "archived"] } },
    orderBy: { eventAt: "desc" },
    take: 4,
  });
  const launch = await db.promoCode.findUnique({ where: { code: "LAUNCH30" } });
  const launchLeft =
    launch && launch.maxUses && (!launch.validUntil || launch.validUntil > new Date())
      ? Math.max(0, launch.maxUses - launch.usedCount)
      : 0;

  const wa = (extra = "") => {
    const text = ["Сәлеметсіз бе! Тойға шақыру жасатқым келеді.", extra, promo ? `Промокод: ${promo}` : "", ref ? `(${ref} шақыруынан көрдім)` : ""]
      .filter(Boolean)
      .join(" ");
    return WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}` : "#";
  };

  return (
    <div className="lp">
      <nav className="lp-nav">
        <Link href="/" className="lp-logo"><Logo />{BRAND.name}</Link>
        <div className="lp-links">
          <a href="#templates">Үлгілер</a>
          <a href="#pricing">Тарифтер</a>
          <a href="#faq">Сұрақтар</a>
        </div>
        <a className="btn lp-nav-cta" href={wa()} target="_blank" rel="noopener">Тапсырыс беру</a>
      </nav>

      <header className="lp-hero">
        <div className="lp-hero-text">
          <p className="lp-badge">Онлайн той шақыру сервисі</p>
          <h1>Тойыңызға нақты сан!</h1>
          <p className="lead">
            Біз әдемі онлайн шақыру жасаймыз. Қонақтарыңыз бір батырмамен жауап береді, ал сіз кімнің келетінін тойдан бұрын білесіз.
          </p>
          <div className="lp-ctas">
            <a className="btn" href={wa()} target="_blank" rel="noopener">Шақыру жасау <Icon name="arrow" /></a>
            <a className="btn ghost" href="#templates"><Icon name="play" /> Үлгілерді көру</a>
          </div>
        </div>
        <div className="lp-hero-visual">
          {HERO_PHOTO ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/hero.jpg" alt="Той шақыруының мысалы" className="lp-hero-photo" />
          ) : (
            portfolio[0] && (
              <div className="phone" aria-label="Мысал шақыру">
                <iframe src={`/${portfolio[0].slug}`} title={`Мысал шақыру: ${portfolio[0].titleKk}`} loading="lazy" />
              </div>
            )
          )}
        </div>
      </header>

      <ul className="lp-strip">
        <li><Icon name="zap" /><span>24 сағатта<br />дайын</span></li>
        <li><Icon name="shield" /><span>Kaspi арқылы<br />төлем</span></li>
        <li><Icon name="users" /><span>Нақты<br />қонақ саны</span></li>
        <li><Icon name="qr" /><span>QR-код<br />және карта</span></li>
      </ul>

      <section className="lp-section" id="templates">
        <div className="lp-section-head">
          <h2>Шақыру үлгілері</h2>
          {portfolio.length > 0 && <a href={`/${portfolio[0].slug}`}>Мысалды ашу <Icon name="arrow" /></a>}
        </div>
        <div className="lp-templates">
          {TEMPLATES.map((t) => (
            <a key={t.id} className="lp-tpl" href={wa(`Маған «${t.name}» үлгісі ұнады.`)} target="_blank" rel="noopener"
              style={{ "--tpl-bg": t.ornament, "--tpl-accent": t.accent } as React.CSSProperties}>
              <span className="lp-tpl-names">Аружан &amp; Мади</span>
              <span className="lp-tpl-divider" aria-hidden />
              <span className="lp-tpl-date">24.08.2026</span>
              <span className="lp-tpl-label">{t.name}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="lp-section">
        <h2>Не аласыз</h2>
        <ul className="features">
          <li><Icon name="users" />Қонақ «Келемін» немесе «Келе алмаймын» батырмасын басады. Сіз кімнің және қанша адамның келетінін тізімнен көресіз.</li>
          <li><Icon name="type" />Апаңыз «Үлкен әріппен көру» батырмасын басып, шақыруды ірі әріппен оқиды. Сіздің дауыстық шақыруыңызды да тыңдай алады.</li>
          <li><Icon name="qr" />Қағаз шақыруға QR-код басасыз. Қонақ оны телефонмен сканерлеп жауап береді, ал сіз оның жауабын сол тізімнен көресіз.</li>
          <li><Icon name="sheet" />Тойханаға Excel тізімін бір батырмамен жүктейсіз. Телефон соғып айтқан туыстарды тізімге өзіңіз қосасыз.</li>
          <li><Icon name="clock" />Біз шақыруды 24 сағатта жасаймыз, ал тойға дейінгі түзетулерге ақы алмаймыз. Сайтты тойдан кейін 3 ай ашық ұстаймыз.</li>
        </ul>
      </section>

      <section className="lp-premium">
        <Icon name="crown" />
        <div>
          <b>Әулет пакеті</b>
          <span>Дизайнды сізге арнап саламыз, видео-шақыру мен қағазға басатын QR карточканы қосамыз.</span>
        </div>
        <a className="btn gold" href="#pricing">Тарифтерді қарау <Icon name="arrow" /></a>
      </section>

      <section className="lp-section" id="pricing">
        <h2>Тарифтер</h2>
        <div className="plans">
          <div className="card"><h3>{PLANS.constructor.kk}</h3><p className="price">{PLANS.constructor.price.toLocaleString("ru-RU")} ₸</p><p className="muted">Жақында</p></div>
          <div className="card featured">
            <h3>{PLANS.ready.kk}</h3>
            <p className="price">{PLANS.ready.price.toLocaleString("ru-RU")} ₸</p>
            {launchLeft > 0 && launch?.fixedPrice != null && (
              <p className="offer">Алғашқы {launch.maxUses} тапсырысқа {launch.fixedPrice.toLocaleString("ru-RU")} ₸ · {launchLeft} орын қалды</p>
            )}
            <p>Шақыруды біз жасаймыз. Ішінде жауап батырмасы, қонақтар тізімі және еске салу хабарламасы бар, қазақша да, орысша да.</p>
            <a className="btn" href={wa(`«${PLANS.ready.kk}» тарифі.`)} target="_blank" rel="noopener">Тапсырыс беру</a>
          </div>
          <div className="card">
            <h3>{PLANS.family.kk}</h3>
            <p className="price">{PLANS.family.price.toLocaleString("ru-RU")} ₸</p>
            <p>Дизайнды сізге арнап саламыз, видео-шақыру мен қағазға басатын QR карточканы қосамыз.</p>
            <a className="btn ghost" href={wa(`«${PLANS.family.kk}» тарифі.`)} target="_blank" rel="noopener">Тапсырыс беру</a>
          </div>
        </div>
      </section>

      <section className="lp-section faq" id="faq">
        <h2>Сұрақтар</h2>
        <details><summary>Үлкен кісілер аша ала ма?</summary><p>Иә, беттің басындағы «Үлкен әріппен көру» батырмасын бассаңыз болды. Телефонмен жауап берген ақсақалдарды тізімге өзіңіз қосасыз.</p></details>
        <details><summary>Сайт қашанға дейін тұрады?</summary><p>Тойдан кейін кемінде 3 ай. Содан соң біз қонақтардың аты мен телефонын өшіреміз.</p></details>
        <details><summary>Ақша қайтарыла ма?</summary><p>Алдымен тегін алдын ала көрініс жібереміз. Ұнамаса, төлемейсіз. Төлегеннен кейін ұнамаса, 24 сағатта қайта жасаймыз немесе ақшаны қайтарамыз.</p></details>
      </section>

      <footer className="lp-foot">
        <span className="lp-logo"><Logo />{BRAND.name}</span>
        <span><Link href="/privacy">Құпиялық саясаты</Link> · <Link href="/offer">Қоғамдық оферта</Link></span>
      </footer>
    </div>
  );
}

function Logo() {
  // Eight-petal ornament mark; gold on cream (decorative, the name next to it carries the meaning)
  return (
    <svg className="lp-mark" viewBox="0 0 32 32" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        {[0, 45, 90, 135].map((a) => <ellipse key={a} cx="16" cy="16" rx="5" ry="13" transform={`rotate(${a} 16 16)`} />)}
        <circle cx="16" cy="16" r="3" fill="currentColor" />
      </g>
    </svg>
  );
}

// Lucide icon paths (ISC licence), inlined so the page needs no icon package.
const ICONS: Record<string, string[]> = {
  users: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75", "M9 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8"],
  type: ["M4 7V4h16v3", "M9 20h6", "M12 4v16"],
  qr: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h3v3h-3z", "M21 14v.01", "M17 21h4v-4", "M14 21v.01"],
  sheet: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M8 13h8", "M8 17h8"],
  clock: ["M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20", "M12 6v6l4 2"],
  zap: ["M13 2 3 14h9l-1 8 10-12h-9l1-8z"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "m9 12 2 2 4-4"],
  arrow: ["M5 12h14", "m12 5 7 7-7 7"],
  play: ["M6 3l14 9-14 9z"],
  crown: ["m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z", "M5 20h14"],
};
function Icon({ name }: { name: string }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
