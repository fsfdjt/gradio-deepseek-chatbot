import assert from "node:assert/strict";
import test from "node:test";
import {
  addCustomItem,
  addCustomProject,
  addEntertainment,
  addMeal,
  addMemo,
  addTask,
  addWorkout,
  createEmptyData,
  deleteTask,
  filterTasks,
  getDashboardSummary,
  getHomeTimeline,
  getTimeRemainingPercentages,
  setTaskDone,
  updateCustomItem,
  updateTask,
} from "../src/lib/domain.ts";

const clock = () => "2026-08-09T09:00:00.000Z";

test("today plan supports add, update, complete, filter, and delete", () => {
  let data = createEmptyData();
  data = addTask(
    data,
    {
      id: "task-1",
      title: "整理 PRD",
      priority: "high",
      plannedDate: "2026-08-09",
    },
    clock,
  );
  data = updateTask(data, "task-1", { note: "作为开发依据" }, clock);
  data = setTaskDone(data, "task-1", true, clock);

  assert.equal(data.tasks[0].note, "作为开发依据");
  assert.equal(data.tasks[0].status, "done");
  assert.equal(filterTasks(data.tasks, "done").length, 1);

  data = deleteTask(data, "task-1");
  assert.equal(data.tasks.length, 0);
});

test("time remaining percentages are calculated for day week month and year", () => {
  const percentages = getTimeRemainingPercentages(new Date(2026, 7, 5, 12, 0, 0));

  assert.deepEqual(percentages, {
    day: 50,
    week: 64.3,
    month: 85.5,
    year: 40.7,
  });
});

test("home timeline combines modules and sorts records by time", () => {
  let data = createEmptyData();
  data = addMeal(
    data,
    {
      id: "meal-lunch",
      content: "午餐",
      date: "2026-08-09",
      time: "12:30",
    },
    clock,
  );
  data = addMemo(
    data,
    {
      id: "memo-1",
      content: "上午备忘",
      createdAt: "2026-08-09T09:30:00.000Z",
      updatedAt: "2026-08-09T09:30:00.000Z",
    },
    clock,
  );
  data = addMeal(
    data,
    {
      id: "meal-breakfast",
      content: "早餐",
      date: "2026-08-09",
      time: "08:00",
    },
    clock,
  );

  const timeline = getHomeTimeline(data, "2026-08-09");

  assert.deepEqual(
    timeline.map((item) => item.title),
    ["早餐", "上午备忘", "午餐"],
  );
});

test("module records are added with the minimum required fields", () => {
  let data = createEmptyData();
  data = addMemo(data, { id: "memo-1", content: "备份本地数据" }, clock);
  data = addWorkout(
    data,
    {
      id: "workout-1",
      name: "上肢力量",
      minutes: 45,
      date: "2026-08-09",
      completed: true,
    },
    clock,
  );
  data = addMeal(
    data,
    {
      id: "meal-1",
      content: "燕麦和鸡蛋",
      waterCups: 2,
      date: "2026-08-09",
    },
    clock,
  );
  data = addEntertainment(
    data,
    {
      id: "fun-1",
      name: "周五休闲",
      status: "active",
    },
    clock,
  );

  assert.equal(data.memos.length, 1);
  assert.equal(data.workouts[0].completed, true);
  assert.equal(data.meals[0].waterCups, 2);
  assert.equal(data.entertainments[0].status, "active");
});

test("custom projects contain editable completable items", () => {
  let data = createEmptyData();
  data = addCustomProject(data, { id: "project-1", name: "读书清单" }, clock);
  data = addCustomItem(data, "project-1", { id: "item-1", title: "读完第一章" }, clock);
  data = updateCustomItem(data, "project-1", "item-1", { completed: true }, clock);

  assert.equal(data.customProjects[0].items.length, 1);
  assert.equal(data.customProjects[0].items[0].completed, true);
});

test("dashboard summary is derived from all modules", () => {
  let data = createEmptyData();
  data = addTask(
    data,
    {
      id: "task-1",
      title: "写 README",
      priority: "high",
      plannedDate: "2026-08-09",
    },
    clock,
  );
  data = addTask(
    data,
    {
      id: "task-2",
      title: "完成训练",
      priority: "medium",
      status: "done",
      plannedDate: "2026-08-09",
    },
    clock,
  );
  data = addMemo(data, { id: "memo-1", content: "记得导出 JSON" }, clock);
  data = addWorkout(data, { id: "workout-1", name: "拉伸", date: "2026-08-09" }, clock);
  data = addMeal(data, { id: "meal-1", content: "午餐", waterCups: 3, date: "2026-08-09" }, clock);
  data = addEntertainment(data, { id: "fun-1", name: "纪录片", status: "active" }, clock);
  data = addCustomProject(data, { id: "project-1", name: "学习计划" }, clock);
  data = addCustomItem(data, "project-1", { id: "item-1", title: "TS 复习" }, clock);

  const summary = getDashboardSummary(data, "2026-08-09");

  assert.equal(summary.todayTaskCount, 2);
  assert.equal(summary.doneTaskCount, 1);
  assert.equal(summary.openTaskCount, 1);
  assert.equal(summary.highPriorityOpenTasks[0].title, "写 README");
  assert.equal(summary.recentMemos[0].content, "记得导出 JSON");
  assert.equal(summary.todayWorkout?.name, "拉伸");
  assert.equal(summary.todayMealCount, 1);
  assert.equal(summary.todayWaterCups, 3);
  assert.equal(summary.activeEntertainment[0].name, "纪录片");
  assert.equal(summary.recentCustomProjects[0].openItemCount, 1);
});
