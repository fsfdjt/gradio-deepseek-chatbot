import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { addMeal, addMemo, addTask, createEmptyData } from "../src/lib/domain.ts";
import { getMonthCalendar } from "../src/lib/calendar.ts";

const clock = () => "2026-08-09T09:00:00.000Z";

test("calendar view groups records by day across the month grid", () => {
  let data = createEmptyData();
  data = addTask(data, { id: "task-1", title: "会议", plannedDate: "2026-08-09" }, clock);
  data = addMeal(data, { id: "meal-1", content: "早餐", date: "2026-08-09" }, clock);
  data = addMemo(
    data,
    {
      id: "memo-1",
      content: "记得复盘",
      createdAt: "2026-08-09T08:30:00.000Z",
      updatedAt: "2026-08-09T08:30:00.000Z",
    },
    clock,
  );

  const month = getMonthCalendar(data, new Date("2026-08-09T09:00:00.000Z"));

  assert.equal(month.label, "2026 年 8 月");
  assert.equal(month.days.length, 42);
  const selectedDay = month.days.find((day) => day.date === "2026-08-09");
  assert.ok(selectedDay);
  assert.equal(selectedDay?.counts.tasks, 1);
  assert.equal(selectedDay?.counts.meals, 1);
  assert.equal(selectedDay?.counts.memos, 1);
});

test("calendar page is wired into navigation and app rendering", () => {
  const source = readFileSync("src/App.tsx", "utf8");
  const structure = readFileSync("src/lib/appStructure.ts", "utf8");

  assert.match(source, /CalendarPage/);
  assert.match(source, /getMonthCalendar/);
  assert.match(source, /calendar/);
  assert.match(structure, /日历视图/);
});
