import { readUpload } from "@/lib/files";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
  const f = await readUpload(id).catch(() => null);
  if (!f) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(f.buf), {
    headers: { "content-type": f.mime, "cache-control": "public, max-age=31536000, immutable" },
  });
}
