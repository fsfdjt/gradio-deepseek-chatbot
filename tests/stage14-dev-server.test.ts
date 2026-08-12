import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("package exposes stable local preview scripts", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));

  assert.equal(pkg.scripts["dev:watch"], "vite --host 0.0.0.0 --strictPort");
  assert.equal(pkg.scripts["dev:restart"], "npm run dev");
});

test("PowerShell helper starts localhost preview on port 5173", () => {
  assert.equal(existsSync("scripts/start-dev-server.ps1"), true);

  const script = readFileSync("scripts/start-dev-server.ps1", "utf8");
  assert.match(script, /Test-NetConnection -ComputerName 127\.0\.0\.1 -Port 5173/);
  assert.match(script, /npm\.cmd/);
  assert.match(script, /dev:watch/);
  assert.match(script, /http:\/\/localhost:5173\//);
});

test("README explains how to restart the local preview server", () => {
  const readme = readFileSync("README.md", "utf8");

  assert.match(readme, /localhost:5173/);
  assert.match(readme, /scripts\/start-dev-server\.ps1/);
});
