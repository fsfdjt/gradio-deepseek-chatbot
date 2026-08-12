import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import vm from "node:vm";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const loadReceiptModule = () => {
  const source = read("miniprogram/utils/receipt.js");
  const context = { module: { exports: {} } };

  vm.runInNewContext(source, context);
  return context.module.exports;
};

test("mini program contains the native application and index page files", () => {
  [
    "miniprogram/app.js",
    "miniprogram/app.json",
    "miniprogram/app.wxss",
    "miniprogram/project.config.json",
    "miniprogram/pages/index/index.js",
    "miniprogram/pages/index/index.wxml",
    "miniprogram/pages/index/index.wxss",
    "miniprogram/utils/receipt.js"
  ].forEach((path) => {
    assert.ok(statSync(new URL(`../${path}`, import.meta.url)).isFile());
  });
});

test("mini program receipt generator selects relevant styles and renders receipt text", () => {
  const { generateReceipt } = loadReceiptModule();
  const receipt = generateReceipt("今天加班到很晚，真的有点累", {
    random: () => 0,
    now: new Date(2026, 7, 12)
  });

  assert.equal(receipt.styleId, "worker-station");
  assert.equal(receipt.dateLabel, "2026.08.12");
  assert.match(receipt.text, /打工人补给站/);
  assert.match(receipt.text, /本次输入：今天加班到很晚，真的有点累/);
});

test("mini program page provides generate, regenerate, style switch, copy and save actions", () => {
  const page = read("miniprogram/pages/index/index.wxml");
  const controller = read("miniprogram/pages/index/index.js");

  assert.match(page, /bindtap="onPrintTap"/);
  assert.match(page, /bindtap="onRegenerateTap"/);
  assert.match(page, /bindtap="onSwitchStyleTap"/);
  assert.match(page, /bindtap="onCopyTap"/);
  assert.match(page, /bindtap="onSaveTap"/);
  assert.match(controller, /wx\.setClipboardData/);
  assert.match(controller, /wx\.saveImageToPhotosAlbum/);
});
