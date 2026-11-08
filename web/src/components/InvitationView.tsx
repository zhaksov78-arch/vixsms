"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { T, EVENT_LABEL, formatDate, formatTime, type Lang } from "@/lib/i18n";
import type { Template } from "@/lib/templates";

export type InvitationData = {
  slug: string;
  eventType: string;
  languages: string[];
  titleKk: string;
  titleRu: string;
  hostsKk: string;
  hostsRu: string;
  messageKk: string;
  messageRu: string;
  eventAt: string;
  venueName: string;
  venueAddress: string;
  venueLat: number | null;
  venueLng: number | null;
  program: { time: string; textKk: string; textRu: string }[];
  photoUrls: string[];
  musicUrl: string | null;
  voiceUrl: string | null;
};

type Props = {
  inv: InvitationData;
  template: Template;
  mode: "live" | "preview" | "over";
  rsvpOpen: boolean;
  source: "link" | "qr";
};

export default function InvitationView({ inv, template, mode, rsvpOpen, source }: Props) {
  const langs = (inv.languages.length ? inv.languages : ["kk"]) as Lang[];
  const [lang, setLang] = useState<Lang>(langs[0]);
  const [elder, setElder] = useState(false);
  const t = T[lang];

  useEffect(() => {
    try {
      if (localStorage.getItem("elder") === "1") setElder(true);
    } catch {}
  }, []);
  const toggleElder = () => {
    setElder((e) => {
      try {
        localStorage.setItem("elder", e ? "0" : "1");
      } catch {}
      return !e;
    });
  };

  const eventAt = useMemo(() => new Date(inv.eventAt), [inv.eventAt]);
  const title = (lang === "kk" ? inv.titleKk : inv.titleRu) || inv.titleKk || inv.titleRu;
  const hosts = (lang === "kk" ? inv.hostsKk : inv.hostsRu) || inv.hostsKk || inv.hostsRu;
  const message = (lang === "kk" ? inv.messageKk : inv.messageRu) || inv.messageKk || inv.messageRu;
  const eventLabel = EVENT_LABEL[inv.eventType]?.[lang] ?? "";

  const mapQuery = inv.venueLat && inv.venueLng ? `${inv.venueLat},${inv.venueLng}` : inv.venueAddress;
  const gis = inv.venueLat && inv.venueLng
    ? `https://2gis.kz/geo/${inv.venueLng},${inv.venueLat}`
    : `https://2gis.kz/search/${encodeURIComponent(inv.venueAddress || inv.venueName)}`;
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery || inv.venueName)}`;

  const style = {
    "--bg": template.bg,
    "--card": template.card,
    "--text": template.text,
    "--accent": template.accent,
    "--accent-text": template.accentText,
    "--ornament": template.ornament,
  } as React.CSSProperties;

  return (
    <div className={`inv ${elder ? "elder" : ""}`} style={style} lang={lang}>
      {mode === "preview" && <div className="watermark" aria-hidden>{t.preview}</div>}

      <div className="topbar">
        <button className="pill" onClick={toggleElder}>{elder ? t.elderOff : t.elderOn}</button>
        {langs.length > 1 && (
          <div className="langs">
            {langs.map((l) => (
              <button key={l} className={`pill ${l === lang ? "on" : ""}`} onClick={() => setLang(l)}>
                {l === "kk" ? "ҚАЗ" : "РУС"}
              </button>
            ))}
          </div>
        )}
      </div>

      <header className="hero">
        <p className="eyebrow">{eventLabel}</p>
        <h1>{title}</h1>
        {inv.photoUrls[0] && !elder && <img className="hero-photo" src={inv.photoUrls[0]} alt={title} />}
      </header>

      <main className="body">
        {mode === "over" ? (
          <section className="card"><p className="big">{t.over}</p></section>
        ) : (
          <>
            {message && <section className="card message"><p>{message}</p></section>}

            <section className="card facts">
              <h2>{t.when}</h2>
              <p className="big">{formatDate(eventAt, lang)}</p>
              <p className="big">{formatTime(eventAt)}</p>
              <h2>{t.where}</h2>
              <p className="big">{inv.venueName}</p>
              {inv.venueAddress && <p>{inv.venueAddress}</p>}
              <div className="row">
                <a className="btn ghost" href={gis} target="_blank" rel="noopener">{t.openMap2gis}</a>
                <a className="btn ghost" href={gmaps} target="_blank" rel="noopener">{t.openMapGoogle}</a>
              </div>
            </section>

            {inv.voiceUrl && <AudioButton src={inv.voiceUrl} label={t.listenVoice} stopLabel={t.pauseMusic} />}

            {!elder && <Countdown to={eventAt} t={t} />}

            {!elder && inv.program.length > 0 && (
              <section className="card">
                <h2>{t.program}</h2>
                <ul className="program">
                  {inv.program.map((p, i) => (
                    <li key={i}><b>{p.time}</b> {(lang === "kk" ? p.textKk : p.textRu) || p.textKk || p.textRu}</li>
                  ))}
                </ul>
              </section>
            )}

            {!elder && inv.photoUrls.length > 1 && (
              <section className="gallery">
                {inv.photoUrls.slice(1).map((u, i) => <img key={i} src={u} alt="" loading="lazy" />)}
              </section>
            )}

            <Rsvp slug={inv.slug} t={t} lang={lang} mode={mode} open={rsvpOpen} source={source} />

            {hosts && <section className="card hosts"><p>{hosts}</p></section>}

            {!elder && inv.musicUrl && <AudioButton src={inv.musicUrl} label={t.playMusic} stopLabel={t.pauseMusic} loop />}
          </>
        )}
      </main>

      <footer className="foot">
        <a href={`/?ref=${encodeURIComponent(inv.slug)}`}>{t.makeOwn}</a>
      </footer>
    </div>
  );
}

function AudioButton({ src, label, stopLabel, loop }: { src: string; label: string; stopLabel: string; loop?: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (playing) a.pause();
    else a.play().catch(() => {});
  };
  return (
    <section className="card center">
      <audio ref={ref} src={src} loop={loop} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      <button className="btn" onClick={toggle}>{playing ? stopLabel : label}</button>
    </section>
  );
}

function Countdown({ to, t }: { to: Date; t: (typeof T)[Lang] }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return null;
  const ms = to.getTime() - now;
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return (
    <section className="card center">
      <h2>{t.countdown}</h2>
      <div className="countdown">
        <span><b>{d}</b> {t.days}</span>
        <span><b>{h}</b> {t.hours}</span>
        <span><b>{m}</b> {t.minutes}</span>
      </div>
    </section>
  );
}

type Saved = { id: string; name: string; attending: boolean; guestsCount: number };

function Rsvp({ slug, t, lang, mode, open, source }: { slug: string; t: (typeof T)[Lang]; lang: Lang; mode: string; open: boolean; source: string }) {
  const storeKey = `rsvp:${slug}`;
  const [attending, setAttending] = useState<boolean | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [editing, setEditing] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const s = JSON.parse(raw) as Saved & { deviceKey: string };
        setSaved(s);
        setEditing(false);
      }
    } catch {}
  }, [storeKey]);

  if (mode === "preview") return <section className="card"><h2>{t.rsvpTitle}</h2><p>{t.previewNote}</p></section>;
  if (!open) return <section className="card"><h2>{t.rsvpTitle}</h2><p>{t.closed}</p></section>;

  if (saved && !editing) {
    return (
      <section className="card center">
        <p className="big">{saved.attending ? t.thanksYes : t.thanksNo}</p>
        <button className="btn ghost" onClick={() => { setAttending(saved.attending); setEditing(true); }}>{t.change}</button>
      </section>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const f = new FormData(e.currentTarget);
    let deviceKey = "";
    try {
      deviceKey = JSON.parse(localStorage.getItem(storeKey) || "{}").deviceKey || "";
    } catch {}
    if (!deviceKey) deviceKey = crypto.randomUUID();
    setBusy(true);
    try {
      const res = await fetch(`/api/i/${encodeURIComponent(slug)}/rsvp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          attending,
          guestsCount: Number(f.get("guestsCount") || 1),
          phone: f.get("phone") || undefined,
          wish: f.get("wish") || undefined,
          consent: f.get("consent") === "on",
          website: f.get("website") || "",
          deviceKey,
          source,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as Saved;
      const s = { ...data, deviceKey };
      try { localStorage.setItem(storeKey, JSON.stringify(s)); } catch {}
      setSaved(s);
      setEditing(false);
    } catch {
      setErr(t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card rsvp" id="rsvp">
      <h2>{t.rsvpTitle}</h2>
      <div className="choice">
        <button type="button" className={`btn big-btn ${attending === true ? "" : "ghost"}`} aria-pressed={attending === true} onClick={() => setAttending(true)}>{t.coming}</button>
        <button type="button" className={`btn big-btn ${attending === false ? "" : "ghost"}`} aria-pressed={attending === false} onClick={() => setAttending(false)}>{t.notComing}</button>
      </div>
      {attending !== null && (
        <form onSubmit={submit}>
          <label>{t.name}<input name="name" required minLength={2} maxLength={80} defaultValue={saved?.name} autoComplete="name" /></label>
          {attending && (
            <label>{t.guests}<input name="guestsCount" type="number" min={1} max={10} defaultValue={saved?.guestsCount ?? 1} inputMode="numeric" /></label>
          )}
          {attending && <label>{t.phone}<input name="phone" type="tel" maxLength={20} placeholder="+7" /></label>}
          <label>{t.wish}<textarea name="wish" maxLength={300} rows={2} /></label>
          <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden />
          <label className="check">
            <input type="checkbox" name="consent" required /> {t.consent} (<a href={`/privacy?lang=${lang}`} target="_blank">{t.privacy}</a>)
          </label>
          <button className="btn big-btn" disabled={busy} aria-busy={busy}>{busy ? "…" : t.send}</button>
          {err && <p className="err">{err}</p>}
        </form>
      )}
    </section>
  );
}
