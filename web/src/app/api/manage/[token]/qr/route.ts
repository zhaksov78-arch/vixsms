import QRCode from "qrcode";
import { invitationByOwnerToken } from "@/lib/owner";
import { PUBLIC_URL } from "@/lib/brand";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await invitationByOwnerToken(token);
  if (!inv) return new Response("Not found", { status: 404 });
  const url = `${PUBLIC_URL}/${inv.slug}?s=qr`;
  const format = new URL(req.url).searchParams.get("format");
  if (format === "svg") {
    const svg = await QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "M" });
    return new Response(svg, {
      headers: { "content-type": "image/svg+xml", "content-disposition": `attachment; filename="qr-${inv.slug}.svg"` },
    });
  }
  const png = await QRCode.toBuffer(url, { width: 1000, margin: 2, errorCorrectionLevel: "M" });
  return new Response(new Uint8Array(png), {
    headers: { "content-type": "image/png", "content-disposition": `attachment; filename="qr-${inv.slug}.png"` },
  });
}
