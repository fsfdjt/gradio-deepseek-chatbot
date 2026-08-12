import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { addTask, createEmptyData, updateTask } from "../src/lib/domain.ts";

const clock = () => "2026-08-12T09:00:00.000Z";

test("today plan edits all planning fields while preserving task identity", () => {
  let data = addTask(
    createEmptyData(),
    {
      id: "task-1",
      title: "整理资料",
      plannedDate: "2026-08-12",
      startTime: "09:00",
      estimatedMinutes: 30,
      priority: "low",
      note: "初始备注",
    },
    clock,
  );

  data = updateTask(
    data,
    "task-1",
    {
      title: "完成项目资料",
      plannedDate: "2026-08-13",
      startTime: "14:30",
      estimatedMinutes: 90,
      priority: "high",
      note: "提交前检查",
    },
    clock,
  );

  assert.deepEqual(data.tasks[0], {
    id: "task-1",
    title: "完成项目资料",
    note: "提交前检查",
    priority: "high",
    status: "todo",
    plannedDate: "2026-08-13",
    startTime: "14:30",
    estimatedMinutes: 90,
    createdAt: "2026-08-12T09:00:00.000Z",
    updatedAt: "2026-08-12T09:00:00.000Z",
  });
});

test("today plan uses an in-page edit form instead of title-only prompt editing", () => {
  const source = readFileSync("src/App.tsx", "utf8");

  assert.match(source, /editingTaskId/);
  assert.match(source, /beginEdit\(task\)/);
  assert.match(source, /保存修改/);
  assert.match(source, /取消编辑/);
  assert.match(source, /if \(editingTaskId === task\.id\)/);
  assert.doesNotMatch(source, /prompt\("编辑任务标题"/);
});
