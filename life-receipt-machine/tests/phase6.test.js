import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Phase 6 includes printing feedback and reduced-motion support", () => {
  const css = read("src/styles.css");

  assert.match(css, /\.receipt\.is-printing/);
  assert.match(css, /@keyframes receipt-print/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("Phase 6 includes accessible busy and status attributes", () => {
  const html = read("index.html");
  const app = read("src/app.js");

  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-label="灵感示例"/);
  assert.match(app, /aria-busy/);
  assert.match(app, /is-printing/);
});

test("all planned source modules contain no unfinished markers", () => {
  for (const path of [
    "src/app.js",
    "src/styles.css",
    "src/receipt-generator.js",
    "src/receipt-templates.js",
    "src/export-image.js"
  ]) {
    const source = read(path);
    assert.doesNotMatch(source, /TODO|FIXME|throw new Error\("Not implemented"\)/i, path);
  }
});
