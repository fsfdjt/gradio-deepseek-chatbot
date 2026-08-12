import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("app shell maps the visual reference into grouped local workbench navigation", () => {
  const source = readFileSync("src/App.tsx", "utf8");
  const css = readFileSync("src/styles.css", "utf8");

  assert.match(source, /navigationGroups/);
  assert.match(source, /items: \["home", "today", "calendar"\]/);
  assert.match(source, /items: \["fitness", "diet", "fun"\]/);
  assert.match(source, /sidebarCollapsed/);
  assert.match(source, /quickMenuOpen/);
  assert.match(source, /快速新增/);
  assert.match(css, /sidebar-collapsed/);
  assert.match(css, /nav-group-label/);
  assert.match(css, /quick-menu/);
});

test("home page is redesigned around today-first workbench sections", () => {
  const source = readFileSync("src/App.tsx", "utf8");
  const css = readFileSync("src/styles.css", "utf8");

  assert.match(source, /HomePageWorkbench/);
  assert.match(source, /今日进度/);
  assert.match(source, /快速操作/);
  assert.match(source, /今日时间线/);
  assert.match(source, /需要关注/);
  assert.match(source, /模块摘要/);
  assert.match(source, /今日复盘提示/);
  assert.match(css, /dashboard-hero/);
  assert.match(css, /overview-strip/);
  assert.match(css, /dashboard-grid/);
  assert.match(css, /attention-item/);
  assert.match(css, /summary-tile/);
});
