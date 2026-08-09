import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { pages } from "../src/lib/appStructure.ts";

test("app navigation exposes every PRD module exactly once", () => {
  assert.deepEqual(
    pages.map((page) => page.label),
    ["首页总览", "今日计划", "健身计划", "饮食计划", "游戏娱乐", "数据与设置"],
  );
});

test("main app wires all page views and module components", () => {
  const source = readFileSync("src/App.tsx", "utf8");
  for (const component of [
    "HomePage",
    "TodayPage",
    "FitnessPage",
    "DietPage",
    "FunPage",
    "ProjectPage",
    "SettingsPage",
  ]) {
    assert.match(source, new RegExp(`<${component}`));
  }
});

test("sidebar supports quick project creation and project list navigation", () => {
  const source = readFileSync("src/App.tsx", "utf8");

  assert.match(source, /className="quick-add-project"/);
  assert.match(source, /aria-label="快速新增项目"/);
  assert.match(source, /placeholder="快速新增项目"/);
  assert.match(source, /快速新增项目/);
  assert.match(source, /className="sidebar-projects"/);
  assert.match(source, /createId\("project"\)/);
  assert.match(source, /setActivePage\("project"\)/);
  assert.equal(source.includes('prompt("新增项目名称"'), false);
});

test("each custom project opens as a dedicated project page", () => {
  const source = readFileSync("src/App.tsx", "utf8");

  assert.match(source, /className="project-page"/);
  assert.match(source, /先在左侧快速新增一个项目/);
  assert.doesNotMatch(source, /<ProjectPage\s+[^>]*data=/);
  assert.doesNotMatch(source, /<h2>项目列表<\/h2>/);
});

test("home page renders an automatically sorted timeline section", () => {
  const source = readFileSync("src/App.tsx", "utf8");

  assert.match(source, /getHomeTimeline/);
  assert.match(source, /今日时间线/);
  assert.match(source, /timeline-list/);
});

test("home page renders remaining time percentages", () => {
  const source = readFileSync("src/App.tsx", "utf8");

  assert.match(source, /getTimeRemainingPercentages/);
  assert.match(source, /剩余时间/);
  assert.match(source, /TimeRemainingRow label="今日"/);
  assert.match(source, /TimeRemainingRow label="本周"/);
  assert.match(source, /TimeRemainingRow label="本月"/);
  assert.match(source, /TimeRemainingRow label="本年"/);
});

test("today plan form captures start time estimated minutes and notes", () => {
  const source = readFileSync("src/App.tsx", "utf8");

  assert.match(source, /const \[startTime, setStartTime\]/);
  assert.match(source, /const \[estimatedMinutes, setEstimatedMinutes\]/);
  assert.match(source, /const \[note, setNote\]/);
  assert.match(source, /aria-label="开始时间"/);
  assert.match(source, /aria-label="预计分钟数"/);
  assert.match(source, /placeholder="备注说明"/);
});

test("responsive layout rules exist for mobile screens", () => {
  const css = readFileSync("src/styles.css", "utf8");
  assert.match(css, /@media \(max-width: 840px\)/);
  assert.match(css, /@media \(max-width: 480px\)/);
  assert.match(css, /grid-template-columns: 1fr/);
});
