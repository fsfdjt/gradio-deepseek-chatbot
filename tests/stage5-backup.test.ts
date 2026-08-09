import assert from "node:assert/strict";
import test from "node:test";
import { createBackup, parseBackup } from "../src/lib/backup.ts";
import { addMemo, addTask, createEmptyData } from "../src/lib/domain.ts";

test("backup export includes app marker, version, timestamp, and all data", () => {
  let data = createEmptyData();
  data = addTask(data, { id: "task-1", title: "发布到 GitHub" });
  data = addMemo(data, { id: "memo-1", content: "导出前检查数据" });

  const backup = createBackup(data, "2026-08-09T10:00:00.000Z");

  assert.equal(backup.app, "work-life-hub");
  assert.equal(backup.version, 1);
  assert.equal(backup.exportedAt, "2026-08-09T10:00:00.000Z");
  assert.equal(backup.data.tasks.length, 1);
  assert.equal(backup.data.memos.length, 1);
});

test("backup import restores a valid JSON backup", () => {
  let data = createEmptyData();
  data = addTask(data, { id: "task-1", title: "恢复数据" });
  const backup = createBackup(data, "2026-08-09T10:00:00.000Z");

  const restored = parseBackup(JSON.stringify(backup));

  assert.equal(restored.data.tasks[0].title, "恢复数据");
});

test("backup import rejects invalid JSON and invalid app data", () => {
  assert.throws(() => parseBackup("{"), /不是有效的 JSON/);
  assert.throws(() => parseBackup(JSON.stringify({ app: "other", version: 1 })), /格式不正确/);
  assert.throws(
    () => parseBackup(JSON.stringify({ app: "work-life-hub", version: 1, exportedAt: "x", data: { version: 1 } })),
    /缺少 今日计划 数据/,
  );
});
