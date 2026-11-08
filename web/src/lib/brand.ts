// The brand name lives here only. Change it in one place when the name is chosen.
export const BRAND = {
  name: "Той шақыру",
  tagline: "Тойханаға нақты сан",
  colors: {
    green: "#1F4D3A",
    gold: "#C9A227",
    cream: "#FBF7EF",
    darkGold: "#8A6A12",
    ink: "#1F1F1F",
  },
};

export const PUBLIC_URL = (process.env.PUBLIC_URL || "http://localhost:3000").replace(/\/$/, "");
export const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || "";

export const PLANS = {
  ready: { kk: "Дайын шақыру", ru: "Готовое приглашение", price: 7900 },
  family: { kk: "Әулет пакеті", ru: "Семейный пакет", price: 19900 },
  constructor: { kk: "Өзім жасаймын", ru: "Сделаю сам", price: 3900 },
} as const;

export const KEEP_DAYS_AFTER_EVENT = 90;
