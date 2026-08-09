import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("project skeleton has the required entry files", () => {
  for (const file of [
    "package.json",
    "index.html",
    "tsconfig.json",
    "vite.config.ts",
    "src/main.tsx",
    "src/App.tsx",
    "src/styles.css",
    "PRD.md",
  ]) {
    assert.equal(existsSync(file), true, `${file} should exist`);
  }
});

test("package scripts include staged tests, full tests, and production build", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(typeof pkg.scripts.build, "string");
  assert.equal(typeof pkg.scripts.test, "string");
  assert.equal(typeof pkg.scripts["test:stage1"], "string");
  assert.equal(pkg.scripts.build.includes("vite build"), true);
});

test("GitHub Pages static base is configured", () => {
  const config = readFileSync("vite.config.ts", "utf8");
  assert.match(config, /base:\s*["']\.\/["']/);
});
