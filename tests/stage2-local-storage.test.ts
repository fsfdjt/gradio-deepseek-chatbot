import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the app enters directly without local credential setup", () => {
  const source = readFileSync("src/App.tsx", "utf8");

  assert.equal(source.includes("createPinRecord"), false);
  assert.equal(source.includes("verifyPin"), false);
  assert.equal(source.includes("sessionPin"), false);
  assert.equal(source.includes("设置本地 PIN"), false);
});

test("plain local app data is persisted through IndexedDB storage helpers", () => {
  const source = readFileSync("src/lib/storage.ts", "utf8");

  assert.match(source, /const APP_DATA_KEY = "appData"/);
  assert.match(source, /export async function loadAppData/);
  assert.match(source, /export async function saveAppData/);
  assert.match(source, /export async function clearAppData/);
});

test("settings copy warns that local data is visible to this browser user", () => {
  const source = readFileSync("src/App.tsx", "utf8");

  assert.match(source, /本网站无需登录/);
  assert.match(source, /任何能打开当前浏览器的人/);
});
