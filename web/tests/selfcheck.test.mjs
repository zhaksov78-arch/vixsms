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
