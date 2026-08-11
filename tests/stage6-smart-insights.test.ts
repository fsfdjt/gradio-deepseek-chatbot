import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  addMeal,
  addTask,
  addWorkout,
  createEmptyData,
} from "../src/lib/domain.ts";
import { getSmartInsights } from "../src/lib/insights.ts";

const clock = () => "2026-08-09T09:00:00.000Z";

test("smart insights summarize the current local workload", () => {
  let data = createEmptyData();
  data = addTask(
    data,
    {
      id: "task-1",
      title: "整理本周计划",
      priority: "high",
      plannedDate: "2026-08-09",
      startTime: "08:30",
    },
    clock,
  );
  data = addTask(
    data,
    {
      id: "task-2",
      title: "补昨天备忘",
      plannedDate: "2026-08-08",
      status: "doing",
    },
    clock,
  );
  data = addWorkout(data, { id: "workout-1", name: "拉伸", date: "2026-08-09" }, clock);
  data = addMeal(data, { id: "meal-1", content: "午餐", waterCups: 2, date: "2026-08-09" }, clock);

  const insights = getSmartInsights(data, "2026-08-09");

  assert.match(insights.headline, /补昨天备忘|优先推进/);
  assert.match(insights.summary, /今日计划/);
  assert.equal(insights.signals.length, 5);
  assert.ok(insights.recommendations.length >= 4);
});

test("home page renders the AI summary panel", () => {
  const source = readFileSync("src/App.tsx", "utf8");

  assert.match(source, /getSmartInsights/);
  assert.match(source, /AI 总结/);
  assert.match(source, /smartInsights/);
});
