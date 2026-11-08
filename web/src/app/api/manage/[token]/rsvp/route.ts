import { db } from "@/lib/db";
import { invitationByOwnerToken, Manual } from "@/lib/owner";



export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await invitationByOwnerToken(token);
  if (!inv) return Response.json({ error: "not_found" }, { status: 404 });
  const p = Manual.safeParse(await req.json().catch(() => null));
  if (!p.success) return Response.json({ error: "invalid" }, { status: 400 });
  const row = await db.rsvp.create({
    data: { ...p.data, guestsCount: p.data.attending ? p.data.guestsCount : 1, invitationId: inv.id, source: "manual" },
  });
  return Response.json({ id: row.id });
}
