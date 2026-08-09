import { createEmptyData } from "./domain.ts";
import type { AppData } from "./types";

export type BackupFile = {
  app: "work-life-hub";
  version: 1;
  exportedAt: string;
  data: AppData;
};

export function createBackup(
  data: AppData,
  exportedAt = new Date().toISOString(),
): BackupFile {
  return {
    app: "work-life-hub",
    version: 1,
    exportedAt,
    data,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertArray(value: unknown, name: string): void {
  if (!Array.isArray(value)) {
    throw new Error(`备份文件缺少 ${name} 数据。`);
  }
}

export function validateAppData(value: unknown): AppData {
  if (!isRecord(value) || value.version !== 1) {
    throw new Error("备份数据版本不受支持。");
  }

  assertArray(value.tasks, "今日计划");
  assertArray(value.memos, "快速备忘");
  assertArray(value.workouts, "健身计划");
  assertArray(value.meals, "饮食计划");
  assertArray(value.entertainments, "游戏娱乐");
  assertArray(value.customProjects, "自定义项目");

  return {
    ...createEmptyData(),
    ...value,
  } as AppData;
}

export function parseBackup(json: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("备份文件不是有效的 JSON。");
  }

  if (!isRecord(parsed) || parsed.app !== "work-life-hub" || parsed.version !== 1) {
    throw new Error("备份文件格式不正确。");
  }

  if (typeof parsed.exportedAt !== "string") {
    throw new Error("备份文件缺少导出时间。");
  }

  return {
    app: "work-life-hub",
    version: 1,
    exportedAt: parsed.exportedAt,
    data: validateAppData(parsed.data),
  };
}
