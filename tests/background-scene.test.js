import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("static frosted background replaces the reference video", () => {
  const html = read("index.html");

  assert.match(html, /<div class="background-scene" aria-hidden="true"><\/div>/);
  assert.doesNotMatch(html, /<video/);
  assert.doesNotMatch(html, /background-flower\.mp4/);
});

test("static background uses frosted glass layers without animation", () => {
  const css = read("src/styles.css");

  assert.match(css, /\.background-scene::before\s*\{[\s\S]*backdrop-filter:\s*blur\(32px\)/);
  assert.match(css, /\.background-scene::before\s*\{[\s\S]*-webkit-backdrop-filter:\s*blur\(32px\)/);
  assert.doesNotMatch(css, /\.background-video/);
  assert.doesNotMatch(
    css,
    /\.background-scene\s*\{[^}]*\banimation\s*:/
  );
  assert.doesNotMatch(
    css,
    /\.background-scene::(?:before|after)\s*\{[^}]*\banimation\s*:/
  );
});

test("main controls use a readable frosted glass surface", () => {
  const css = read("src/styles.css");

  assert.match(css, /\.control-panel\s*\{[\s\S]*background:\s*rgba\(25, 30, 27, 0\.36\)/);
  assert.match(css, /\.control-panel\s*\{[\s\S]*backdrop-filter:\s*blur\(18px\)/);
});

test("3D background keeps primary application content above the animation", () => {
  const css = read("src/styles.css");

  assert.match(css, /\.app-shell,[\s\S]*?\.site-note\s*\{[\s\S]*z-index:\s*1/);
  assert.match(css, /\.background-scene\s*\{[\s\S]*z-index:\s*0/);
});
