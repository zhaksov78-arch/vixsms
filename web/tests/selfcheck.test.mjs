// node --test tests/  (Node 22.18+ runs the .ts imports directly)
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate, formatTime } from "../src/lib/i18n.ts";
import { slugify } from "../src/lib/tokens.ts";

test("dates print in Almaty time with Kazakh/Russian names, without Intl locale data", () => {
  const d = new Date("2026-12-31T20:30:00Z"); // 01:30 on 1 Jan in Almaty (UTC+5)
  assert.equal(formatDate(d, "kk"), "2027 ж. 1 қаңтар, жұма");
  assert.equal(formatDate(d, "ru"), "1 января 2027 г., пятница");
  assert.equal(formatTime(d), "01:30");
});

test("slugify transliterates Kazakh letters and never returns an empty slug", () => {
  assert.equal(slugify("Нұрлан мен Әсем 2026"), "nurlan-men-asem-2026");
  assert.equal(slugify("!!!"), "toi");
});

import { totp, verifyTotp } from "../src/lib/totp.ts";

test("TOTP matches the RFC 6238 test vector and rejects wrong codes", () => {
  const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"; // base32 of "12345678901234567890"
  assert.equal(totp(secret, 59_000, 8), "94287082");
  assert.equal(totp(secret, 1111111109_000, 8), "07081804");
  assert.ok(verifyTotp(secret, totp(secret, 1_000_000_000), 1_000_000_000 + 25_000));
  assert.ok(!verifyTotp(secret, "000000", 59_000));
  assert.ok(!verifyTotp(secret, "12ab56"));
});
