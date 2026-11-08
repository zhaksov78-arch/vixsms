import { db } from "@/lib/db";
import { invitationByOwnerToken, Manual } from "@/lib/owner";

type Ctx = { params: Promise<{ token: string; id: string }> };

async function own(ctx: Ctx) {
  const { token, id } = await ctx.params;
  const inv = await invitationByOwnerToken(token);
  if (!inv) return null;
  const row = await db.rsvp.findFirst({ where: { id, invitationId: inv.id } });
  return row;
}

export async function PATCH(req: Request, ctx: Ctx) {
  const row = await own(ctx);
  if (!row) return Response.json({ error: "not_found" }, { status: 404 });
  const p = Manual.partial().safeParse(await req.json().catch(() => null));
  if (!p.success) return Response.json({ error: "invalid" }, { status: 400 });
  await db.rsvp.update({ where: { id: row.id }, data: p.data });
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, ctx: Ctx) {
  const row = await own(ctx);
  if (!row) return Response.json({ error: "not_found" }, { status: 404 });
  await db.rsvp.delete({ where: { id: row.id } });
  return Response.json({ ok: true });
}
