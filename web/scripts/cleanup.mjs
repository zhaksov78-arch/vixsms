// Run daily (cron). Erases guests' personal data 90 days after the event (TZ §6.3)
// and archives finished invitations. Totals are kept by replacing names, not deleting rows.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const now = new Date();

const due = await db.invitation.findMany({ where: { expiresAt: { lt: now }, piiErasedAt: null }, select: { id: true } });
for (const { id } of due) {
  await db.$transaction([
    db.rsvp.updateMany({ where: { invitationId: id }, data: { name: "—", phone: null, wish: null, deviceKey: null } }),
    db.invitation.update({ where: { id }, data: { piiErasedAt: now, status: "archived" } }),
  ]);
}
console.log(`erased guest data for ${due.length} invitation(s)`);
await db.$disconnect();
