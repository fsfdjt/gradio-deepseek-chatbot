import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("3D flower background is included behind the application", () => {
  const html = read("index.html");

  assert.match(html, /<div class="background-scene" aria-hidden="true">/);
  assert.match(html, /<div class="flower-scene">/);
  assert.doesNotMatch(html, /scene-plane/);

  const petalMatches = html.match(/class="flower-petal flower-petal-/g) ?? [];

  assert.equal(petalMatches.length, 10);
  assert.match(html, /class="flower-center"/);
});

test("3D flower background defines perspective and autoplay animations", () => {
  const css = read("src/styles.css");

  assert.match(css, /\.background-scene\s*\{[\s\S]*perspective:\s*1200px/);
  assert.match(css, /\.flower-scene\s*\{[\s\S]*animation:\s*flower-float/);
  assert.match(css, /\.flower-petal\s*\{[\s\S]*animation:\s*flower-petal-bloom/);
  assert.match(css, /@keyframes flower-float/);
  assert.match(css, /@keyframes flower-petal-bloom/);
});

test("3D flower animation definitions are not duplicated in responsive styles", () => {
  const css = read("src/styles.css");
  const animationNames = ["flower-float", "flower-petal-bloom", "scene-dust-float"];

  animationNames.forEach((animationName) => {
    const definitions = css.match(new RegExp(`@keyframes ${animationName}`, "g")) ?? [];

    assert.equal(definitions.length, 1);
  });
});

test("3D background keeps primary application content above the animation", () => {
  const css = read("src/styles.css");

  assert.match(css, /\.app-shell,[\s\S]*?\.site-note\s*\{[\s\S]*z-index:\s*1/);
  assert.match(css, /\.background-scene\s*\{[\s\S]*z-index:\s*0/);
});
