"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { verifyTotp } from "@/lib/totp";
import { slugify, token } from "@/lib/tokens";
import { expiresAtFor, type ProgramItem } from "@/lib/invitations";
import { saveUpload } from "@/lib/files";
import { PLANS } from "@/lib/brand";
import type { EventType, Plan } from "@prisma/client";

// Per IP, so a stranger's failed guesses cannot lock the real admin out.
const loginHits = new Map<string, number[]>(); // shortcut: per-process memory, move to Redis if we run >1 server

export async function login(_: unknown, form: FormData) {
  const now = Date.now();
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (loginHits.size > 10_000) loginHits.clear();
  const hits = (loginHits.get(ip) || []).filter((t) => now - t < 15 * 60_000);
  loginHits.set(ip, hits);
  if (hits.length >= 10) return { error: "Тым көп әрекет. 15 минуттан кейін көріңіз." };
  const totpSecret = process.env.ADMIN_TOTP_SECRET;
  if (!totpSecret && process.env.NODE_ENV === "production") return { error: "2FA бапталмаған: ADMIN_TOTP_SECRET қойыңыз" };
  const passOk = checkPassword(String(form.get("password") || ""));
  const codeOk = !totpSecret || verifyTotp(totpSecret, String(form.get("code") || "").trim());
  if (!passOk || !codeOk) {
    hits.push(now);
    return { error: "Құпиясөз немесе код қате" };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

// Interprets "YYYY-MM-DDTHH:mm" from the form as Almaty time (UTC+5, no DST).
function almaty(local: string): Date {
  const d = new Date(`${local}:00+05:00`);
  if (isNaN(d.getTime())) throw new Error("Күні қате");
  return d;
}

const RESERVED = new Set(["admin", "api", "p", "manage", "privacy", "offer", "_next", "favicon-ico", "robots-txt"]);

async function uniqueSlug(base: string, exceptId?: string) {
  let slug = slugify(base);
  for (let i = 2; ; i++) {
    const hit = RESERVED.has(slug) ? { id: "reserved" } : await db.invitation.findUnique({ where: { slug } });
    if (!hit || hit.id === exceptId) return slug;
    slug = `${slugify(base)}-${i}`;
  }
}

export async function createInvitation(form: FormData) {
  await requireAdmin();
  const title = String(form.get("titleKk") || "").trim() || "toi";
  const eventAt = almaty(String(form.get("eventAt")));
  const inv = await db.invitation.create({
    data: {
      slug: await uniqueSlug(`${title}-${eventAt.getUTCFullYear()}`),
      titleKk: title,
      eventType: (String(form.get("eventType")) || "wedding") as EventType,
      eventAt,
      expiresAt: expiresAtFor(eventAt),
      ownerToken: token(),
      previewToken: token(),
      clientName: String(form.get("clientName") || ""),
      clientPhone: String(form.get("clientPhone") || ""),
    },
  });
  redirect(`/admin/i/${inv.id}`);
}

function parseProgram(text: string): ProgramItem[] {
  // One item per line: "18:00 | Қонақтарды қарсы алу | Встреча гостей"
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [time = "", textKk = "", textRu = ""] = l.split("|").map((s) => s.trim());
      return { time, textKk, textRu };
    });
}

// Shows a readable error on the edit page instead of Next's generic production error screen.
function failTo(id: string, e: unknown): never {
  redirect(`/admin/i/${id}?error=${encodeURIComponent(e instanceof Error ? e.message : "Қате")}`);
}

export async function saveInvitation(id: string, form: FormData) {
  await requireAdmin();
  try {
    await doSave(id, form);
  } catch (e) {
    failTo(id, e);
  }
  redirect(`/admin/i/${id}`);
}

async function doSave(id: string, form: FormData) {
  const inv = await db.invitation.findUniqueOrThrow({ where: { id } });
  const eventAt = almaty(String(form.get("eventAt")));
  const languages = ["kk", "ru"].filter((l) => form.get(`lang_${l}`) === "on");
  // Frozen once paid: a new slug would break links already sent and QR codes already printed.
  const slugWanted = inv.paidAt ? inv.slug : String(form.get("slug") || inv.slug).trim();
  const num = (v: FormDataEntryValue | null) => (v && String(v).trim() ? Number(v) : null);

  const photoIds = [...inv.photoIds];
  for (const f of form.getAll("photos")) {
    if (f instanceof File && f.size > 0) photoIds.push(await saveUpload("photo", f));
  }
  const removeIds = form.getAll("removePhoto").map(String);
  const music = form.get("music");
  const voice = form.get("voice");

  await db.invitation.update({
    where: { id },
    data: {
      slug: slugWanted !== inv.slug ? await uniqueSlug(slugWanted, id) : inv.slug,
      templateId: String(form.get("templateId") || "classic"),
      eventType: String(form.get("eventType")) as EventType,
      languages: languages.length ? languages : ["kk"],
      titleKk: String(form.get("titleKk") || ""),
      titleRu: String(form.get("titleRu") || ""),
      hostsKk: String(form.get("hostsKk") || ""),
      hostsRu: String(form.get("hostsRu") || ""),
      messageKk: String(form.get("messageKk") || ""),
      messageRu: String(form.get("messageRu") || ""),
      eventAt,
      expiresAt: expiresAtFor(eventAt),
      venueName: String(form.get("venueName") || ""),
      venueAddress: String(form.get("venueAddress") || ""),
      venueLat: num(form.get("venueLat")),
      venueLng: num(form.get("venueLng")),
      program: parseProgram(String(form.get("program") || "")),
      photoIds: photoIds.filter((p) => !removeIds.includes(p)).slice(0, 10),
      musicFileId: music instanceof File && music.size > 0 ? await saveUpload("audio", music) : form.get("removeMusic") ? null : inv.musicFileId,
      voiceFileId: voice instanceof File && voice.size > 0 ? await saveUpload("audio", voice) : form.get("removeVoice") ? null : inv.voiceFileId,
      rsvpOpen: form.get("rsvpOpen") === "on",
      rsvpDeadline: form.get("rsvpDeadline") ? almaty(String(form.get("rsvpDeadline"))) : null,
      isPortfolio: form.get("isPortfolio") === "on",
      clientName: String(form.get("clientName") || ""),
      clientPhone: String(form.get("clientPhone") || ""),
    },
  });
  if (inv.status === "draft") await db.invitation.update({ where: { id }, data: { status: "preview" } });
}

export async function markPaid(id: string, form: FormData) {
  await requireAdmin();
  try {
    await doMarkPaid(id, form);
  } catch (e) {
    failTo(id, e);
  }
  redirect(`/admin/i/${id}`);
}

async function doMarkPaid(id: string, form: FormData) {
  const plan = String(form.get("plan") || "ready") as Plan;
  const code = String(form.get("promo") || "").trim().toUpperCase();
  let price: number = PLANS[plan].price;
  let promoCodeId: string | null = null;
  if (code) {
    const promo = await db.promoCode.findUnique({ where: { code } });
    if (!promo || (promo.validUntil && promo.validUntil < new Date())) throw new Error("Промокод жарамсыз");
    const newPrice =
      promo.fixedPrice != null && plan === "ready" ? promo.fixedPrice
      : promo.discountKzt ? Math.max(0, price - promo.discountKzt)
      : promo.kind === "partner" ? price // partner codes track referrals without a discount
      : null;
    if (newPrice === null) throw new Error("Бұл промокод осы тарифке жарамайды");
    // Atomic claim so a limited code (e.g. LAUNCH30) cannot be used more than maxUses times.
    const claimed = await db.promoCode.updateMany({
      where: { id: promo.id, ...(promo.maxUses ? { usedCount: { lt: promo.maxUses } } : {}) },
      data: { usedCount: { increment: 1 } },
    });
    if (claimed.count === 0) throw new Error("Промокод лимиті бітті");
    promoCodeId = promo.id;
    price = newPrice;
  }
  await db.invitation.update({
    where: { id },
    data: { status: "published", plan, priceKzt: price, promoCodeId, paidAt: new Date(), paidBy: "admin" },
  });
}

export async function refund(id: string, form: FormData) {
  await requireAdmin();
  await db.invitation.update({
    where: { id },
    data: { status: "refunded", refundedAt: new Date(), refundReason: String(form.get("reason") || "") },
  });
  revalidatePath(`/admin/i/${id}`);
}

export async function setStatus(id: string, status: "preview" | "published" | "archived") {
  await requireAdmin();
  await db.invitation.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/i/${id}`);
}

export async function rotateOwnerToken(id: string) {
  await requireAdmin();
  await db.invitation.update({ where: { id }, data: { ownerToken: token() } });
  revalidatePath(`/admin/i/${id}`);
}

export async function createPromo(form: FormData) {
  await requireAdmin();
  const n = (k: string) => (form.get(k) ? Number(form.get(k)) : null);
  await db.promoCode.create({
    data: {
      code: String(form.get("code")).trim().toUpperCase(),
      kind: form.get("kind") === "partner" ? "partner" : "discount",
      fixedPrice: n("fixedPrice"),
      discountKzt: n("discountKzt"),
      partnerName: String(form.get("partnerName") || "") || null,
      maxUses: n("maxUses"),
      validUntil: form.get("validUntil") ? almaty(`${form.get("validUntil")}T23:59`) : null,
    },
  });
  revalidatePath("/admin/promo");
}
