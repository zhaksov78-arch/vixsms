import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { invitationByOwnerToken } from "@/lib/owner";
import { PUBLIC_URL } from "@/lib/brand";
import { formatDate, formatTime } from "@/lib/i18n";
import OwnerPanel from "@/components/OwnerPanel";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Қонақтар тізімі" };

export default async function Manage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await invitationByOwnerToken(token);
  if (!inv) notFound();
  const link = `${PUBLIC_URL}/${inv.slug}`;
  const when = `${formatDate(inv.eventAt, "kk")}, ${formatTime(inv.eventAt)}`;
  const reminder =
    `Құрметті қонақтар! Ертең, ${when}, ${inv.venueName} тойханасында күтеміз. ` +
    `Келетініңізді растамаған болсаңыз, мына сілтемеден жауап беріңіз: ${link}\n\n` +
    `Уважаемые гости! Ждём вас завтра в ${inv.venueName}. Если ещё не ответили, подтвердите присутствие: ${link}`;
  return <OwnerPanel token={token} title={inv.titleKk || inv.titleRu} when={when} link={link} reminder={reminder} />;
}
