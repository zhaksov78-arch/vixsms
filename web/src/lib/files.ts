import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { db } from "./db";
import { token } from "./tokens";

const DIR = path.resolve(process.env.UPLOAD_DIR || "./uploads");

const LIMITS: Record<string, { mimes: string[]; max: number }> = {
  photo: { mimes: ["image/jpeg", "image/png", "image/webp"], max: 10 * 1024 * 1024 },
  audio: { mimes: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/ogg"], max: 5 * 1024 * 1024 },
};

export async function saveUpload(kind: "photo" | "audio", file: File): Promise<string> {
  const rule = LIMITS[kind];
  if (!rule.mimes.includes(file.type)) throw new Error(`Файл түрі қабылданбайды: ${file.type}`);
  if (file.size > rule.max) throw new Error(`Файл тым үлкен (ең көбі ${rule.max / 1024 / 1024} МБ)`);
  await mkdir(DIR, { recursive: true });
  const key = `${kind}-${token(12)}`;
  await writeFile(path.join(DIR, key), Buffer.from(await file.arrayBuffer()));
  const rec = await db.file.create({ data: { kind, storageKey: key, mime: file.type, size: file.size } });
  return rec.id;
}

export async function readUpload(id: string) {
  const rec = await db.file.findUnique({ where: { id } });
  if (!rec) return null;
  const buf = await readFile(path.join(DIR, rec.storageKey));
  return { buf, mime: rec.mime };
}
