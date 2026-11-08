import { z } from "zod";
import { db } from "./db";

export async function invitationByOwnerToken(token: string) {
  if (!token || token.length < 20) return null;
  const inv = await db.invitation.findUnique({ where: { ownerToken: token } });
  if (!inv || !["paid", "published", "archived"].includes(inv.status)) return null;
  return inv;
}

export const Manual = z.object({
  name: z.string().trim().min(1).max(80),
  attending: z.boolean(),
  guestsCount: z.number().int().min(1).max(30).default(1),
  phone: z.string().trim().max(20).optional().nullable(),
  wish: z.string().trim().max(300).optional().nullable(),
});
