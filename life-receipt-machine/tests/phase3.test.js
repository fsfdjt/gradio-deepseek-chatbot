import assert from "node:assert/strict";
import { test } from "node:test";
import {
  STYLE_IDS,
  generateReceipt,
  getNextStyleId,
  inferStyleId,
  renderReceiptText
} from "../src/receipt-generator.js";

const fixedDate = new Date("2026-08-10T12:00:00.000Z");
const sequence = (values) => {
  let index = 0;
  return () => values[index++ % values.length];
};

test("Phase 3 exposes four receipt styles", () => {
  assert.equal(STYLE_IDS.length, 4);
  assert.deepEqual(new Set(STYLE_IDS).size, 4);
});

test("keywords route to the intended receipt style", () => {
  assert.equal(inferStyleId("今天加班好累", sequence([0.1])), "worker-station");
  assert.equal(inferStyleId("下雨还迟到了", sequence([0.1])), "absurd-office");
  assert.equal(inferStyleId("今天被夸了好开心", sequence([0.1])), "gentle-store");
  assert.equal(inferStyleId("昨晚梦见了宇宙", sequence([0.1])), "cosmic-counter");
});

test("unknown input still receives a valid random style", () => {
  assert.equal(STYLE_IDS.includes(inferStyleId("今天发生了一件事", () => 0.99)), true);
});

test("generated receipt contains all required output fields", () => {
  const receipt = generateReceipt("今天有点累但撑过来了", {
    now: fixedDate,
    random: sequence([0.01, 0.25, 0.48, 0.72, 0.95])
  });
  const text = renderReceiptText(receipt);

  assert.equal(receipt.styleId, "worker-station");
  assert.equal(receipt.items.length, 4);
  assert.match(receipt.receiptNumber, /^20260810-\d{3}$/);
  assert.match(text, /打工人|星期一|摸鱼/);
  assert.match(text, /今日合计：/);
  assert.match(text, /生活税：/);
  assert.match(text, /快乐返现：/);
  assert.match(text, /店员留言：/);
  assert.match(text, /本次输入：今天有点累但撑过来了/);
});

test("next style cycles through all styles", () => {
  let current = STYLE_IDS[0];
  for (let index = 0; index < STYLE_IDS.length; index += 1) {
    current = getNextStyleId(current);
  }
  assert.equal(current, STYLE_IDS[0]);
});

