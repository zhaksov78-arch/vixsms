import { notFound } from "next/navigation";
import { TEMPLATES } from "@/lib/templates";
import { sampleInvitation } from "@/lib/sample";
import InvitationView from "@/components/InvitationView";

export const metadata = { title: "Үлгіні алдын ала көру" };

export default async function Demo({ params, searchParams }: { params: Promise<{ template: string }>; searchParams: Promise<{ type?: string }> }) {
  const { template } = await params;
  const { type } = await searchParams;
  const t = TEMPLATES.find((x) => x.id === template);
  if (!t) notFound();
  return <InvitationView inv={sampleInvitation(type || t.eventTypes[0])} template={t} mode="preview" rsvpOpen={false} source="link" />;
}
