import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("home page fills the central empty area with a current focus panel", () => {
  const source = readFileSync("src/App.tsx", "utf8");
  const css = readFileSync("src/styles.css", "utf8");

  assert.match(source, /className="panel focus-panel"/);
  assert.match(source, /当前焦点/);
  assert.match(source, /下一件事/);
  assert.match(source, /今日记录分布/);
  assert.match(source, /今天还没有安排/);
  assert.match(source, /先安排一个具体行动，让今天开始运转/);
  assert.match(source, /focusDistribution/);
  assert.match(css, /focus-panel/);
  assert.match(css, /focus-distribution-row/);
});

test("focus panel uses existing local modules instead of adding new storage", () => {
  const source = readFileSync("src/App.tsx", "utf8");

  assert.match(source, /timeline\.filter\(\(item\) => item\.module === "today"\)/);
  assert.match(source, /data\.tasks\.filter\(\(task\) => task\.plannedDate === today\)/);
  assert.match(source, /data\.workouts\.filter\(\(item\) => item\.date === today\)/);
  assert.match(source, /data\.meals\.filter\(\(item\) => item\.date === today\)/);
  assert.match(source, /summary\.activeEntertainment\.length/);
});
