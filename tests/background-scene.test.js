import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("3D background scene is included behind the application", () => {
  const html = read("index.html");

  assert.match(html, /<div class="background-scene" aria-hidden="true">/);
  assert.match(html, /scene-plane-one/);
  assert.match(html, /scene-plane-two/);
  assert.match(html, /scene-plane-three/);
  assert.match(html, /scene-plane-four/);
});

test("3D background scene defines perspective and autoplay animations", () => {
  const css = read("src/styles.css");

  assert.match(css, /\.background-scene\s*\{[\s\S]*perspective:\s*1200px/);
  assert.match(css, /transform-style:\s*preserve-3d/);
  assert.match(css, /@keyframes scene-drift-one/);
  assert.match(css, /@keyframes scene-drift-two/);
  assert.match(css, /@keyframes scene-drift-three/);
  assert.match(css, /animation:\s*scene-drift-one/);
});

test("3D animation definitions are not duplicated in responsive styles", () => {
  const css = read("src/styles.css");
  const animationNames = [
    "scene-drift-one",
    "scene-drift-two",
    "scene-drift-three",
    "scene-drift-four",
    "scene-dust-float",
  ];

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
