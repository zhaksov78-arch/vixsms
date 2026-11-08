import type { Invitation } from "@prisma/client";
import type { InvitationData } from "@/components/InvitationView";
import { db } from "./db";
import { KEEP_DAYS_AFTER_EVENT } from "./brand";

export type ProgramItem = { time: string; textKk: string; textRu: string };

export function expiresAtFor(eventAt: Date): Date {
  return new Date(eventAt.getTime() + KEEP_DAYS_AFTER_EVENT * 24 * 3600 * 1000);
}

export async function summary(invitationId: string) {
  const rows = await db.rsvp.groupBy({
    by: ["attending"],
    where: { invitationId },
    _count: { _all: true },
    _sum: { guestsCount: true },
  });
  const yes = rows.find((r) => r.attending);
  const no = rows.find((r) => !r.attending);
  return {
    comingPeople: yes?._sum.guestsCount ?? 0,
    comingAnswers: yes?._count._all ?? 0,
    notComing: no?._count._all ?? 0,
  };
}

export function rsvpIsOpen(inv: { status: string; rsvpOpen: boolean; rsvpDeadline: Date | null; expiresAt: Date }) {
  const now = new Date();
  return (
    inv.status === "published" &&
    inv.rsvpOpen &&
    (!inv.rsvpDeadline || inv.rsvpDeadline > now) &&
    inv.expiresAt > now
  );
}


export function toView(inv: Invitation): InvitationData {
  const f = (id: string | null) => (id ? `/api/files/${id}` : null);
  return {
    slug: inv.slug,
    eventType: inv.eventType,
    languages: inv.languages,
    titleKk: inv.titleKk,
    titleRu: inv.titleRu,
    hostsKk: inv.hostsKk,
    hostsRu: inv.hostsRu,
    messageKk: inv.messageKk,
    messageRu: inv.messageRu,
    eventAt: inv.eventAt.toISOString(),
    venueName: inv.venueName,
    venueAddress: inv.venueAddress,
    venueLat: inv.venueLat,
    venueLng: inv.venueLng,
    program: (Array.isArray(inv.program) ? inv.program : []) as ProgramItem[],
    photoUrls: inv.photoIds.map((id) => `/api/files/${id}`),
    musicUrl: f(inv.musicFileId),
    voiceUrl: f(inv.voiceFileId),
  };
}
