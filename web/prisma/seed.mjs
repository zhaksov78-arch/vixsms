// Dev seed: the launch promo code and one published demo invitation.
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const db = new PrismaClient();
const tok = () => randomBytes(24).toString("base64url");

await db.promoCode.upsert({
  where: { code: "LAUNCH30" },
  update: {},
  create: { code: "LAUNCH30", kind: "discount", fixedPrice: 5900, maxUses: 30, validUntil: new Date("2026-12-31T18:59:00Z") },
});

const eventAt = new Date("2026-12-20T13:00:00Z"); // 18:00 Almaty
const demo = await db.invitation.upsert({
  where: { slug: "demo-aidos-aruzhan" },
  update: {},
  create: {
    slug: "demo-aidos-aruzhan",
    status: "published",
    eventType: "wedding",
    languages: ["kk", "ru"],
    titleKk: "Айдос пен Аружан",
    titleRu: "Айдос и Аружан",
    messageKk: "Құрметті ағайын-туыс, дос-жаран! Сіздерді ұлымыз Айдос пен келініміз Аружанның үйлену тойына арналған салтанатты ақ дастарханымыздың қадірлі қонағы болуға шақырамыз.",
    messageRu: "Дорогие родные и друзья! Приглашаем вас на свадебный той нашего сына Айдоса и невестки Аружан.",
    hostsKk: "Той иелері: Ерлан мен Гүлнар",
    hostsRu: "Хозяева тоя: Ерлан и Гульнар",
    eventAt,
    expiresAt: new Date(eventAt.getTime() + 90 * 86400000),
    venueName: "«Ақ Орда» мейрамханасы",
    venueAddress: "Алматы, Абай даңғылы, 1",
    venueLat: 43.2389,
    venueLng: 76.8897,
    program: [
      { time: "18:00", textKk: "Қонақтарды қарсы алу", textRu: "Встреча гостей" },
      { time: "19:00", textKk: "Тойдың ашылуы", textRu: "Открытие тоя" },
    ],
    ownerToken: tok(),
    previewToken: tok(),
    plan: "ready",
    priceKzt: 7900,
    paidAt: new Date(),
    paidBy: "seed",
    isPortfolio: true,
  },
});
console.log("demo invitation:", `/${demo.slug}`, "owner panel:", `/manage/${demo.ownerToken}`);
await db.$disconnect();
