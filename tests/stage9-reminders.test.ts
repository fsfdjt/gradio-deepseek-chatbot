import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  addEntertainment,
  addMeal,
  addTask,
  addWorkout,
  createEmptyData,
} from "../src/lib/domain.ts";
import { getReminderItems } from "../src/lib/reminders.ts";

const clock = () => "2026-08-09T09:00:00.000Z";

test("reminder items are derived from local tasks and schedules", () => {
  let data = createEmptyData();
  data = addTask(
    data,
    {
      id: "task-1",
      title: "早会",
      plannedDate: "2026-08-09",
      startTime: "09:30",
    },
    clock,
  );
  data = addWorkout(data, { id: "workout-1", name: "拉伸", date: "2026-08-09" }, clock);
  data = addMeal(data, { id: "meal-1", content: "午餐", date: "2026-08-09", time: "12:00" }, clock);
  data = addEntertainment(
    data,
    {
      id: "fun-1",
      name: "看电影",
      status: "active",
      plannedTime: "2026-08-09T20:00:00.000Z",
    },
    clock,
  );

  const reminders = getReminderItems(data, new Date("2026-08-09T09:00:00.000Z"));

  assert.equal(reminders.length >= 3, true);
  assert.equal(reminders[0].kind, "task");
  assert.match(reminders[0].timeLabel, /后|现在|已过/);
});

test("settings page exposes notification controls and reminder list", () => {
  const source = readFileSync("src/App.tsx", "utf8");

  assert.match(source, /notificationPermission/);
  assert.match(source, /Notification\.requestPermission/);
  assert.match(source, /new Notification\("Work Life Hub 提醒"/);
  assert.match(source, /提醒系统/);
  assert.match(source, /reminderItems/);
  assert.match(source, /启用通知/);
});
