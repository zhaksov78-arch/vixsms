"use client";

import { useState } from "react";
import { EVENT_LABEL, dateParts } from "@/lib/i18n";
import type { Template } from "@/lib/templates";
import Cover from "./Cover";

const TYPES = ["wedding", "qyz_uzatu", "sundet", "tusau_keser", "merey_toi"];
// Made-up sample names, not real clients.
const SAMPLE: Record<string, string> = { wedding: "Аружан & Мади", qyz_uzatu: "Аружан", sundet: "Әли", tusau_keser: "Айлин", merey_toi: "Ерлан 60 жаста" };
const DP = dateParts(new Date("2027-08-24T13:00:00Z"), "kk");

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
          <article key={t.id} className="lp-tpl">
            <a href={`/demo/${t.id}?type=${type}`} target="_blank" rel="noopener" aria-label={`«${t.name}» үлгісін ашып көру`}>
              <Cover mini template={t} label={EVENT_LABEL[type].kk} title={SAMPLE[type]} {...DP} sub="2027 · 18:00" venue="Royal Palace" />
            </a>
            <div className="lp-tpl-meta">
              <b>{t.name}</b>
              <a className="btn" href={waBase === "#" ? "#" : `${waBase}${encodeURIComponent(` Маған «${t.name}» үлгісі ұнады (${EVENT_LABEL[type].kk}).`)}`} target="_blank" rel="noopener">Таңдау</a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
