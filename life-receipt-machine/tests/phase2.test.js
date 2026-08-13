import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Phase 2 CSS defines the desktop generator layout", () => {
  const css = read("src/styles.css");

  assert.match(css, /\.app-shell\s*{[\s\S]*display:\s*grid/);
  assert.match(css, /\.app-shell\s*{[\s\S]*grid-template-columns:/);
  assert.match(css, /\.receipt-stage\s*{[\s\S]*min-height:\s*560px/);
  assert.match(css, /\.receipt\s*{[\s\S]*width:\s*min\(100%,\s*390px\)/);
});

test("Phase 2 CSS defines receipt paper styling", () => {
  const css = read("src/styles.css");

  assert.match(css, /--paper:\s*#fffaf0/);
  assert.match(css, /font-family:\s*"Courier New",\s*"Microsoft YaHei",\s*monospace/);
  assert.match(css, /\.receipt::before/);
  assert.match(css, /background-image:[\s\S]*radial-gradient/);
});

test("Phase 2 CSS includes mobile responsive behavior", () => {
  const css = read("src/styles.css");

  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.match(css, /grid-template-columns:\s*1fr/);
  assert.match(css, /\.receipt-stage\s*{[\s\S]*padding:\s*18px/);
});

test("index keeps first-screen app structure without a marketing landing page", () => {
  const html = read("index.html");

  assert.match(html, /<main class="app-shell" data-app>/);
  assert.match(html, /<section class="control-panel"/);
  assert.match(html, /<section class="preview-panel"/);
  assert.doesNotMatch(html, /pricing|套餐|subscribe|hero-card/i);
});
