import { z } from "zod";
import { db } from "@/lib/db";
import { rsvpIsOpen } from "@/lib/invitations";

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  attending: z.boolean(),
  guestsCount: z.number().int().min(1).max(10).default(1),
  phone: z.string().trim().max(20).regex(/^\+?[0-9 ()-]{6,20}$/).optional(),
  wish: z.string().trim().max(300).optional(),
  consent: z.literal(true),
  website: z.string().max(0).optional(), // honeypot must stay empty
  deviceKey: z.string().uuid(),
  source: z.enum(["link", "qr"]).default("link"),
});

// Simple in-memory rate limit: 10 requests / minute / IP / invitation.
const hits = new Map<string, number[]>();
function limited(key: string): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > 10;
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(`${ip}:${slug}`)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  const b = parsed.data;

  const inv = await db.invitation.findUnique({ where: { slug } });
  if (!inv) return Response.json({ error: "not_found" }, { status: 404 });
  if (!rsvpIsOpen(inv)) return Response.json({ error: "closed" }, { status: 403 });

  const data = {
    name: b.name,
    attending: b.attending,
    guestsCount: b.attending ? b.guestsCount : 1,
    phone: b.attending ? b.phone ?? null : null,
    wish: b.wish ?? null,
    consentAt: new Date(),
  };
  const row = await db.rsvp.upsert({
    where: { invitationId_deviceKey: { invitationId: inv.id, deviceKey: b.deviceKey } },
    create: { ...data, invitationId: inv.id, deviceKey: b.deviceKey, source: b.source },
    update: data,
  });
  return Response.json({ id: row.id, name: row.name, attending: row.attending, guestsCount: row.guestsCount });
}
