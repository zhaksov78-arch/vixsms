"use client";

import { useState } from "react";
import { EVENT_LABEL } from "@/lib/i18n";
import type { Template } from "@/lib/templates";

const TYPES = ["wedding", "qyz_uzatu", "sundet", "tusau_keser", "merey_toi"];
const SAMPLE_NAME: Record<string, string> = { wedding: "Аружан & Мади", qyz_uzatu: "Аружан", sundet: "Әли", tusau_keser: "Айлин", merey_toi: "Ерлан · 60" };

export default function TemplateGallery({ templates, waBase }: { templates: Template[]; waBase: string }) {
  const [type, setType] = useState("wedding");
  const list = templates.filter((t) => t.eventTypes.includes(type));
  return (
    <>
      <div className="lp-chips" role="group" aria-label="Той түрі">
        {TYPES.map((k) => (
          <button key={k} type="button" className={`pill ${k === type ? "on" : ""}`} aria-pressed={k === type} onClick={() => setType(k)}>
            {EVENT_LABEL[k].kk}
          </button>
        ))}
      </div>
      <div className="lp-templates">
        {list.map((t) => (
          <div key={t.id} className="lp-tpl" style={{ "--tpl-bg": t.ornament, "--tpl-accent": t.accent } as React.CSSProperties}>
            <span className="lp-tpl-type">{EVENT_LABEL[type].kk}</span>
            <span className="lp-tpl-names">{SAMPLE_NAME[type]}</span>
            <span className="lp-tpl-divider" aria-hidden />
            <span className="lp-tpl-date">24.08.2026</span>
            <span className="lp-tpl-actions">
              <a className="btn ghost light" href={`/demo/${t.id}?type=${type}`} target="_blank" rel="noopener">Көру</a>
              <a className="btn gold" href={waBase === "#" ? "#" : `${waBase}${encodeURIComponent(` Маған «${t.name}» үлгісі ұнады (${EVENT_LABEL[type].kk}).`)}`} target="_blank" rel="noopener">Таңдау</a>
            </span>
            <span className="lp-tpl-label">{t.name}</span>
          </div>
        ))}
      </div>
    </>
  );
}
