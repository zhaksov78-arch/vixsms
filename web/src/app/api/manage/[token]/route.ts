import { db } from "@/lib/db";
import { invitationByOwnerToken } from "@/lib/owner";
import { summary } from "@/lib/invitations";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await invitationByOwnerToken(token);
  if (!inv) return Response.json({ error: "not_found" }, { status: 404 });
  const rows = await db.rsvp.findMany({
    where: { invitationId: inv.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, attending: true, guestsCount: true, phone: true, wish: true, source: true, createdAt: true },
  });
  return Response.json({ summary: await summary(inv.id), rows, piiErased: !!inv.piiErasedAt });
}
