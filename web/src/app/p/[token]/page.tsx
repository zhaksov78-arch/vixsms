import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getTemplate } from "@/lib/templates";
import { toView } from "@/lib/invitations";
import InvitationView from "@/components/InvitationView";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Preview({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await db.invitation.findUnique({ where: { previewToken: token } });
  if (!inv || inv.status === "refunded") notFound();
  return <InvitationView inv={toView(inv)} template={getTemplate(inv.templateId)} mode="preview" rsvpOpen={false} source="link" />;
}
