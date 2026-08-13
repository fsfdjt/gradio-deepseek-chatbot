import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Phase 1 files exist", () => {
  for (const path of [
    "index.html",
    "src/styles.css",
    "src/app.js",
    "assets/favicon.svg",
    "package.json"
  ]) {
    assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true, `${path} should exist`);
  }
});

test("index.html exposes the required MVP structure", () => {
  const html = read("index.html");

  assert.match(html, /<title>人生小票机<\/title>/);
  assert.match(html, /data-receipt-form/);
  assert.match(html, /data-input/);
  assert.match(html, /data-print-button/);
  assert.match(html, /data-receipt/);
  assert.match(html, /data-actions/);
  assert.match(html, /src\/styles\.css/);
  assert.match(html, /src\/app\.js/);
});

test("app.js is loaded as an ES module", () => {
  const html = read("index.html");

  assert.match(html, /<script type="module" src="src\/app\.js"><\/script>/);
});
