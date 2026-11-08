import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Әкімші" };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin">{children}</div>;
}
