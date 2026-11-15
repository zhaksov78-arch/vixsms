// MVP templates live in code (the TZ's template table comes later).
export type Template = {
  id: string;
  name: string;
  bg: string;
  card: string;
  text: string;
  accent: string; // decorative only, never body text
  accentText: string; // AA-safe text colour for headings on bg
  ornament: string; // CSS background for the header band
  eventTypes: string[]; // which toi types the landing gallery lists it under
};

export const TEMPLATES: Template[] = [
  {
    id: "classic",
    name: "Классика (жасыл-алтын)",
    bg: "#FBF7EF",
    card: "#FFFFFF",
    text: "#1F1F1F",
    accent: "#C9A227",
    accentText: "#1F4D3A",
    ornament: "linear-gradient(135deg,#1F4D3A 0%,#2C6A50 100%)",
    eventTypes: ["wedding", "merey_toi", "sundet"],
  },
  {
    id: "night",
    name: "Түнгі көк",
    bg: "#0F1B2D",
    card: "#16263D",
    text: "#F4F1EA",
    accent: "#C9A227",
    accentText: "#E8D9A8",
    ornament: "linear-gradient(135deg,#0F1B2D 0%,#23395B 100%)",
    eventTypes: ["wedding", "merey_toi"],
  },
  {
    id: "rose",
    name: "Қызғылт (қыз ұзату)",
    bg: "#FFF6F6",
    card: "#FFFFFF",
    text: "#2A1A1A",
    accent: "#D8A1A1",
    accentText: "#7A2E3A",
    ornament: "linear-gradient(135deg,#7A2E3A 0%,#A4495A 100%)",
    eventTypes: ["qyz_uzatu", "wedding"],
  },
  {
    id: "terracotta",
    name: "Терракота",
    bg: "#FBF4EE",
    card: "#FFFFFF",
    text: "#2A1C14",
    accent: "#D9A066",
    accentText: "#7A3E1D",
    ornament: "linear-gradient(135deg,#7A3E1D 0%,#A3542A 100%)",
    eventTypes: ["sundet", "merey_toi", "tusau_keser"],
  },
  {
    id: "sky",
    name: "Көк аспан",
    bg: "#F2F8F9",
    card: "#FFFFFF",
    text: "#14262B",
    accent: "#8CC9D3",
    accentText: "#0F4C5C",
    ornament: "linear-gradient(135deg,#0F4C5C 0%,#1D6F80 100%)",
    eventTypes: ["tusau_keser", "sundet", "qyz_uzatu"],
  },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
