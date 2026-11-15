import type { Template } from "@/lib/templates";

export type CoverProps = {
  template: Template;
  label: string;
  title: string;
  weekday: string;
  day: string;
  month: string;
  sub: string; // "2026 · 18:00"
  venue?: string;
  photo?: string | null;
  mini?: boolean; // small card on the landing page: no min-height, no animation, not a heading
};

// The invitation's first screen. All sizes are in cqw so the same markup works full-size and as a thumbnail.
export default function Cover({ template: t, label, title, weekday, day, month, sub, venue, photo, mini }: CoverProps) {
  const vars = { "--cover-bg": t.coverBg, "--cover-text": t.coverText, "--cover-accent": t.coverAccent } as React.CSSProperties;
  const Title = mini ? "div" : "h1";
  return (
    <div className={`cover ${mini ? "mini" : ""}`} style={vars}>
      <div className="cv-frame">
        {photo ? <img className="cv-photo" src={photo} alt="" /> : <Crown />}
        <p className="cv-label">{label}</p>
        <Title className={`cv-title ${title.length > 22 ? "long" : ""}`}>{title}</Title>
        <div className="divider" aria-hidden><span /></div>
        <div className="cv-date"><span>{weekday}</span><b>{day}</b><span>{month}</span></div>
        <p className="cv-sub">{sub}</p>
        {venue && <p className="cv-venue">{venue}</p>}
      </div>
    </div>
  );
}

const LEAF = "M0 0C5-6 14-6 19 0C14 6 5 6 0 0Z";
const r1 = (n: number) => n.toFixed(1);

// Two leafy branches rising from a small blossom: our own drawing, generated from a curve.
function Crown() {
  const wing = (sign: 1 | -1) => {
    const pts = Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      return [120 + sign * (10 + 98 * t), 60 - 44 * Math.pow(t, 1.5)];
    });
    return (
      <g key={sign}>
        <polyline points={pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        {pts.slice(1).map((p, i) => {
          const prev = pts[i];
          const ang = (Math.atan2(p[1] - prev[1], p[0] - prev[0]) * 180) / Math.PI;
          const s = 1 - 0.5 * ((i + 1) / 8);
          return (
            <g key={i} transform={`translate(${r1(p[0])} ${r1(p[1])}) rotate(${r1(ang)}) scale(${r1(s)})`}>
              <path d={LEAF} transform="rotate(-40)" />
              <path d={LEAF} transform="rotate(40)" />
            </g>
          );
        })}
      </g>
    );
  };
  return (
    <svg className="cv-crown" viewBox="0 0 240 72" aria-hidden fill="currentColor">
      {wing(-1)}
      {wing(1)}
      {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="120" cy="52" rx="3.4" ry="7.5" transform={`rotate(${a} 120 60)`} opacity="0.85" />)}
      <circle cx="120" cy="60" r="2.6" />
    </svg>
  );
}
