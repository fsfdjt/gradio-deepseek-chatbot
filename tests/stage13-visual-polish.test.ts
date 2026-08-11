import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("visual polish defines a cohesive surface and interaction system", () => {
  const css = readFileSync("src/styles.css", "utf8");

  assert.match(css, /--surface:/);
  assert.match(css, /--surface-strong:/);
  assert.match(css, /--ring:/);
  assert.match(css, /min-height: 100dvh/);
  assert.match(css, /button:focus-visible/);
  assert.match(css, /input:focus-visible/);
  assert.match(css, /button:active/);
});

test("workspace navigation and panels use refined glass hierarchy", () => {
  const css = readFileSync("src/styles.css", "utf8");

  assert.match(css, /\.sidebar\s*{/);
  assert.match(css, /-webkit-backdrop-filter: blur\(18px\) saturate\(150%\)/);
  assert.match(css, /\.panel::before/);
  assert.match(css, /\.stat-card::before/);
  assert.match(css, /--panel-highlight/);
  assert.match(css, /--row-hover/);
});

test("record, calendar, chart, and theme controls have tactile states", () => {
  const css = readFileSync("src/styles.css", "utf8");

  assert.match(css, /\.record-row:hover/);
  assert.match(css, /\.calendar-day:hover/);
  assert.match(css, /\.theme-option:hover/);
  assert.match(css, /color-mix\(in srgb, var\(--primary\) 58%, var\(--success\)\)/);
});
