import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { pages } from "../src/lib/appStructure.ts";
import { getLayoutPreset } from "../src/lib/layoutPresets.ts";

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

test("layout presets automatically choose component patterns for each page", () => {
  assert.equal(getLayoutPreset("home").kind, "dashboard");
  assert.equal(getLayoutPreset("today").kind, "record-manager");
  assert.equal(getLayoutPreset("project").kind, "project-detail");
  assert.equal(getLayoutPreset("settings").kind, "settings");
  assert.deepEqual(getLayoutPreset("home").components, [
    "card",
    "progress",
    "timeline",
    "sidebar",
  ]);
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

test("theme styles expose shadcn-inspired tokens and page layout classes", () => {
  const css = readFileSync("src/styles.css", "utf8");
  const source = readFileSync("src/App.tsx", "utf8");

  assert.match(css, /--background:/);
  assert.match(css, /--foreground:/);
  assert.match(css, /--card:/);
  assert.match(css, /--primary:/);
  assert.match(css, /workspace-dashboard/);
  assert.match(css, /workspace-record-manager/);
  assert.match(css, /workspace-project-detail/);
  assert.match(source, /getLayoutPreset\(activePage\)/);
});

test("workspace uses a project-local background image with a readable overlay", () => {
  const css = readFileSync("src/styles.css", "utf8");

  assert.match(css, /url\("\/background\/workspace\.jpg"\)/);
  assert.match(css, /workspace::before/);
  assert.match(css, /workspace::after/);
  assert.match(css, /background: rgba\(255, 255, 255, 0\.16\)/);
  assert.match(css, /-webkit-backdrop-filter: blur\(20px\) saturate\(180%\)/);
  assert.match(css, /pointer-events: none/);
});

test("macOS weather glass background is applied with Safari prefix and dark mode", () => {
  const css = readFileSync("src/styles.css", "utf8");
  assert.match(css, /-webkit-backdrop-filter: blur\(20px\) saturate\(180%\)/);
  assert.match(css, /backdrop-filter: blur\(20px\) saturate\(180%\)/);
  assert.match(css, /background: rgba\(255, 255, 255, 0\.15\)/);
  assert.match(css, /border: 1px solid rgba\(255, 255, 255, 0\.2\)/);
  assert.match(css, /border-radius: 16px/);
  assert.match(css, /prefers-color-scheme: dark/);
  assert.match(css, /background: rgba\(0, 0, 0, 0\.2\)/);
});

test("grey helper text is smaller and UI hints avoid Chinese periods", () => {
  const css = readFileSync("src/styles.css", "utf8");
  const appSource = readFileSync("src/App.tsx", "utf8");
  const structureSource = readFileSync("src/lib/appStructure.ts", "utf8");

  assert.match(css, /Smaller grey helper text/);
  assert.match(css, /font-size: 12px/);
  assert.equal(appSource.includes("。"), false);
  assert.equal(structureSource.includes("。"), false);
});

test("record frames use varied soft accent colors", () => {
  const css = readFileSync("src/styles.css", "utf8");

  assert.match(css, /--record-accent:/);
  assert.match(css, /--record-bg:/);
  assert.match(css, /\.record-row:nth-child\(5n \+ 2\)/);
  assert.match(css, /\.timeline-item:nth-child\(5n \+ 3\)/);
  assert.match(css, /\.compact-item:nth-child\(5n \+ 4\)/);
  assert.match(css, /border-left: 4px solid var\(--record-accent\)/);
});
