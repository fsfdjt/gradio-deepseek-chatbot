import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("reference video background is included behind the application", () => {
  const html = read("index.html");

  assert.match(html, /<div class="background-scene" aria-hidden="true">/);
  assert.match(
    html,
    /<video class="background-video" autoplay muted loop playsinline preload="auto">/
  );
  assert.match(html, /<source src="assets\/background-flower\.mp4" type="video\/mp4">/);
});

test("reference video asset is shipped with the application", () => {
  const asset = statSync(new URL("../assets/background-flower.mp4", import.meta.url));

  assert.ok(asset.isFile());
  assert.ok(asset.size > 0);
});

test("reference video background fills the scene without obstructing content", () => {
  const css = read("src/styles.css");

  assert.match(css, /\.background-video\s*\{[\s\S]*object-fit:\s*cover/);
  assert.match(css, /\.background-scene::before\s*\{[\s\S]*z-index:\s*1/);
});

test("reference video honors reduced motion preferences", () => {
  const css = read("src/styles.css");

  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.background-video\s*\{[\s\S]*display:\s*none/);
});

test("3D background keeps primary application content above the animation", () => {
  const css = read("src/styles.css");

  assert.match(css, /\.app-shell,[\s\S]*?\.site-note\s*\{[\s\S]*z-index:\s*1/);
  assert.match(css, /\.background-scene\s*\{[\s\S]*z-index:\s*0/);
});
