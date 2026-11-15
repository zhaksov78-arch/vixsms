// MVP templates live in code (the TZ's template table comes later).
export type Template = {
  id: string;
  name: string;
  bg: string; // page background below the cover
  card: string;
  text: string;
  accent: string; // decorative only, never body text
  accentText: string; // AA-safe colour for headings and buttons on bg/card
  coverBg: string; // first screen
  coverText: string; // AA-safe on coverBg
  coverAccent: string; // decorative lines and leaves on the cover
  eventTypes: string[]; // which toi types the landing gallery lists it under
};

export const TEMPLATES: Template[] = [
  { id: "classic", name: "Классика", bg: "#FBF7EF", card: "#FFFFFF", text: "#1F1F1F", accent: "#C9A227", accentText: "#1F4D3A",
    coverBg: "#FBF7EF", coverText: "#1F4D3A", coverAccent: "#C2A14A", eventTypes: ["wedding", "merey_toi", "sundet"] },
  { id: "emerald", name: "Зүбәржат", bg: "#FBF7EF", card: "#FFFFFF", text: "#1F1F1F", accent: "#C9A227", accentText: "#1F4D3A",
    coverBg: "#173B2C", coverText: "#F3E6BC", coverAccent: "#C9A227", eventTypes: ["wedding", "merey_toi"] },
  { id: "night", name: "Түнгі көк", bg: "#0F1B2D", card: "#16263D", text: "#F4F1EA", accent: "#C9A227", accentText: "#E8D9A8",
    coverBg: "#0F1B2D", coverText: "#F1E3B5", coverAccent: "#C9A227", eventTypes: ["wedding", "merey_toi"] },
  { id: "rose", name: "Қызғылт", bg: "#FFF8F7", card: "#FFFFFF", text: "#2A1A1A", accent: "#D8A1A1", accentText: "#7A2E3A",
    coverBg: "#FBEDEC", coverText: "#7A2E3A", coverAccent: "#CF9C9C", eventTypes: ["qyz_uzatu", "wedding"] },
  { id: "terracotta", name: "Терракота", bg: "#FBF4EE", card: "#FFFFFF", text: "#2A1C14", accent: "#D9A066", accentText: "#7A3E1D",
    coverBg: "#F7E9DD", coverText: "#7A3E1D", coverAccent: "#CF9A63", eventTypes: ["sundet", "merey_toi", "tusau_keser"] },
  { id: "sky", name: "Көк аспан", bg: "#F4F9FA", card: "#FFFFFF", text: "#14262B", accent: "#8CC9D3", accentText: "#0F4C5C",
    coverBg: "#E6F2F4", coverText: "#0F4C5C", coverAccent: "#7DBBC6", eventTypes: ["tusau_keser", "sundet", "qyz_uzatu"] },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
