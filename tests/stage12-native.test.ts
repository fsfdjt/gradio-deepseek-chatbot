import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("native mobile shell exposes Capacitor configuration", () => {
  assert.equal(existsSync("capacitor.config.ts"), true);

  const config = readFileSync("capacitor.config.ts", "utf8");
  assert.match(config, /appId:\s*"com\.worklifehub\.app"/);
  assert.match(config, /appName:\s*"Work Life Hub"/);
  assert.match(config, /webDir:\s*"dist"/);
});

test("package scripts include mobile build and sync entry points", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));

  assert.equal(pkg.scripts["mobile:build"], "npm run build");
  assert.equal(pkg.scripts["mobile:sync"], "npx cap sync");
});

test("README explains native mobile setup requirements", () => {
  const readme = readFileSync("README.md", "utf8");

  assert.match(readme, /Native Mobile App/);
  assert.match(readme, /npm run mobile:build/);
  assert.match(readme, /npx cap add android/);
  assert.match(readme, /npx cap add ios/);
});
