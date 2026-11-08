import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { db } from "./db";
import { token } from "./tokens";

const DIR = path.resolve(process.env.UPLOAD_DIR || "./uploads");

const LIMITS: Record<string, { mimes: string[]; max: number }> = {
  photo: { mimes: ["image/jpeg", "image/png", "image/webp"], max: 10 * 1024 * 1024 },
  audio: { mimes: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/ogg"], max: 5 * 1024 * 1024 },
};

function looksLike(kind: "photo" | "audio", b: Buffer): boolean {
  const ascii = (o: number, n: number) => b.subarray(o, o + n).toString("latin1");
  if (kind === "photo")
    return (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || // JPEG
      ascii(0, 8) === "\x89PNG\r\n\x1a\n" ||
      (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP");
  return ascii(0, 3) === "ID3" || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) || // MP3
    ascii(4, 4) === "ftyp" || // M4A/MP4/AAC in MP4
    ascii(0, 4) === "OggS";
}

export async function saveUpload(kind: "photo" | "audio", file: File): Promise<string> {
  const rule = LIMITS[kind];
  if (!rule.mimes.includes(file.type)) throw new Error(`Файл түрі қабылданбайды: ${file.type}`);
  if (file.size > rule.max) throw new Error(`Файл тым үлкен (ең көбі ${rule.max / 1024 / 1024} МБ)`);
  const buf = Buffer.from(await file.arrayBuffer());
  // The browser-declared type is user input: check the file's real signature too.
  if (!looksLike(kind, buf)) throw new Error("Файлдың ішкі мазмұны сурет/аудио емес");
  await mkdir(DIR, { recursive: true });
  const key = `${kind}-${token(12)}`;
  await writeFile(path.join(DIR, key), buf);
  const rec = await db.file.create({ data: { kind, storageKey: key, mime: file.type, size: file.size } });
  return rec.id;
}

export async function readUpload(id: string) {
  const rec = await db.file.findUnique({ where: { id } });
  if (!rec) return null;
  const buf = await readFile(path.join(DIR, rec.storageKey));
  return { buf, mime: rec.mime };
}
