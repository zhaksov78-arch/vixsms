import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getTemplate } from "@/lib/templates";
import { rsvpIsOpen, toView } from "@/lib/invitations";
import { EVENT_LABEL, formatDate } from "@/lib/i18n";
import { PUBLIC_URL } from "@/lib/brand";
import InvitationView from "@/components/InvitationView";

type P = { params: Promise<{ slug: string }>; searchParams: Promise<{ s?: string }> };

async function load(slug: string) {
  const inv = await db.invitation.findUnique({ where: { slug } });
  if (!inv || !["published", "archived"].includes(inv.status)) return null;
  return inv;
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const inv = await load(slug);
  if (!inv) return {};
  const title = `${inv.titleKk || inv.titleRu} · ${EVENT_LABEL[inv.eventType]?.kk ?? ""}`;
  const description = `${formatDate(inv.eventAt, "kk")} · ${inv.venueName}`;
  const image = inv.photoIds[0] ? `${PUBLIC_URL}/api/files/${inv.photoIds[0]}` : undefined;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", url: `${PUBLIC_URL}/${inv.slug}`, images: image ? [image] : [] },
  };
}

export default async function Page({ params, searchParams }: P) {
  const { slug } = await params;
  const { s } = await searchParams;
  const inv = await load(slug);
  if (!inv) notFound();
  const over = inv.status === "archived" || inv.expiresAt < new Date();
  return (
    <InvitationView
      inv={toView(inv)}
      template={getTemplate(inv.templateId)}
      mode={over ? "over" : "live"}
      rsvpOpen={rsvpIsOpen(inv)}
      source={s === "qr" ? "qr" : "link"}
    />
  );
}
