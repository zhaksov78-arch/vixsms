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
        <p className="lead">Біз шақыру сайтын жасаймыз, қонақтарыңыз бір батырмамен жауап береді, ал сіз тойханаға нақты санды айтасыз. Алдымен тегін көріп шығасыз, ұнаса ғана төлейсіз.</p>
        <a className="btn big-btn" href={wa} target="_blank" rel="noopener">WhatsApp-қа жазу</a>
      </header>

      <section className="l-section">
        <h2>Не аласыз</h2>
        <ul className="features">
          <li>Қонақ «Келемін» немесе «Келе алмаймын» батырмасын басады. Сіз кімнің және қанша адамның келетінін тізімнен көресіз.</li>
          <li>Апаңыз «Үлкен әріппен көру» батырмасын басып, шақыруды ірі әріппен оқиды. Сіздің дауыстық шақыруыңызды да тыңдай алады.</li>
          <li>Қағаз шақыруға QR-код басасыз. Қонақ оны телефонмен сканерлеп жауап береді, ал сіз оның жауабын сол тізімнен көресіз.</li>
          <li>Тойханаға Excel тізімін бір батырмамен жүктейсіз. Телефон соғып айтқан туыстарды тізімге өзіңіз қосасыз.</li>
          <li>Біз шақыруды 24 сағатта жасаймыз, ал тойға дейінгі түзетулерге ақы алмаймыз. Сайтты тойдан кейін 3 ай ашық ұстаймыз.</li>
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
