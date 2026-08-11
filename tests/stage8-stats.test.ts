import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { addMeal, addMemo, addTask, addWorkout, createEmptyData } from "../src/lib/domain.ts";
import { getStatsOverview } from "../src/lib/stats.ts";

const clock = () => "2026-08-09T09:00:00.000Z";

test("stats overview combines local data into weekly and module charts", () => {
  let data = createEmptyData();
  data = addTask(data, { id: "task-1", title: "周报", plannedDate: "2026-08-09", status: "done" }, clock);
  data = addWorkout(data, { id: "workout-1", name: "慢跑", date: "2026-08-09" }, clock);
  data = addMeal(data, { id: "meal-1", content: "午餐", waterCups: 2, date: "2026-08-09" }, clock);
  data = addMemo(
    data,
    {
      id: "memo-1",
      content: "复盘",
      createdAt: "2026-08-09T08:00:00.000Z",
      updatedAt: "2026-08-09T08:00:00.000Z",
    },
    clock,
  );

  const stats = getStatsOverview(data, "2026-08-09");

  assert.equal(stats.weeklyActivity.length, 7);
  assert.equal(stats.moduleBreakdown.length, 6);
  assert.ok(stats.totalRecords >= 4);
  assert.equal(stats.todayWaterCups, 2);
  assert.match(stats.recommendation, /节奏/);
});

test("stats page is wired into the app and navigation", () => {
  const source = readFileSync("src/App.tsx", "utf8");
  const structure = readFileSync("src/lib/appStructure.ts", "utf8");

  assert.match(source, /StatsPage/);
  assert.match(source, /getStatsOverview/);
  assert.match(source, /activePage === "stats"/);
  assert.match(structure, /统计图表/);
});
