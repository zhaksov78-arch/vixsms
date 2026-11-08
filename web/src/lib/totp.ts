import { createHmac, timingSafeEqual } from "crypto";

// RFC 6238 TOTP (6 digits, 30 s, SHA-1): what Google Authenticator and similar apps use.
function base32(s: string): Buffer {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of s.toUpperCase().replace(/=+$/, "").replace(/\s/g, "")) {
    const v = A.indexOf(c);
    if (v < 0) throw new Error("bad base32");
    bits += v.toString(2).padStart(5, "0");
  }
  const out = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(out);
}

export function totp(secret: string, at = Date.now(), digits = 6): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 1000 / 30)));
  const h = createHmac("sha1", base32(secret)).update(counter).digest();
  const o = h[h.length - 1] & 0xf;
  const n = (h.readUInt32BE(o) & 0x7fffffff) % 10 ** digits;
  return String(n).padStart(digits, "0");
}

// Accepts the previous, current and next 30 s window to allow for clock drift.
export function verifyTotp(secret: string, code: string, at = Date.now()): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  return [-1, 0, 1].some((w) => {
    const a = Buffer.from(totp(secret, at + w * 30_000));
    return timingSafeEqual(a, Buffer.from(code));
  });
}
