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
  },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
