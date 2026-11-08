import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { invitationByOwnerToken } from "@/lib/owner";

const SRC: Record<string, string> = { link: "Сілтеме", qr: "QR-код", manual: "Қолмен" };

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await invitationByOwnerToken(token);
  if (!inv) return new Response("Not found", { status: 404 });
  const rows = await db.rsvp.findMany({ where: { invitationId: inv.id }, orderBy: [{ attending: "desc" }, { name: "asc" }] });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Қонақтар");
  ws.columns = [
    { header: "№", key: "n", width: 5 },
    { header: "Аты-жөні", key: "name", width: 32 },
    { header: "Адам саны", key: "count", width: 11 },
    { header: "Жауабы", key: "ans", width: 14 },
    { header: "Телефон", key: "phone", width: 16 },
    { header: "Тілек", key: "wish", width: 40 },
    { header: "Арна", key: "src", width: 12 },
    { header: "Уақыты", key: "at", width: 18 },
  ];
  ws.getRow(1).font = { bold: true };
  rows.forEach((r, i) =>
    ws.addRow({
      n: i + 1,
      name: r.name,
      count: r.attending ? r.guestsCount : 0,
      ans: r.attending ? "Келеді" : "Келмейді",
      phone: r.phone ?? "",
      wish: r.wish ?? "",
      src: SRC[r.source],
      at: r.createdAt.toLocaleString("ru-RU", { timeZone: "Asia/Almaty" }),
    })
  );
  const total = rows.filter((r) => r.attending).reduce((s, r) => s + r.guestsCount, 0);
  const last = ws.addRow({ name: "БАРЛЫҒЫ КЕЛЕДІ", count: total });
  last.font = { bold: true };

  const buf = await wb.xlsx.writeBuffer();
  return new Response(new Uint8Array(buf as ArrayBuffer), {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="qonaqtar-${inv.slug}.xlsx"`,
      "cache-control": "no-store",
    },
  });
}
