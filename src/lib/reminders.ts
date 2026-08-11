import type { AppData } from "./types";

export type ReminderKind = "task" | "workout" | "meal" | "entertainment";

export type ReminderItem = {
  id: string;
  kind: ReminderKind;
  title: string;
  timeLabel: string;
  scheduledAt: string;
  minutesUntil: number;
  overdue: boolean;
};

function toDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

function formatMinutesUntil(minutes: number): string {
  if (minutes <= 0) {
    return "现在";
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} 分钟后`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = Math.round(minutes % 60);
  return remainder ? `${hours} 小时 ${remainder} 分钟后` : `${hours} 小时后`;
}

function addReminder(
  items: ReminderItem[],
  id: string,
  kind: ReminderKind,
  title: string,
  scheduledAt: Date,
  now: Date,
): void {
  const diff = Math.round((scheduledAt.getTime() - now.getTime()) / 60000);
  const overdue = diff < 0;
  if (diff > 24 * 60) {
    return;
  }
  items.push({
    id,
    kind,
    title,
    timeLabel: overdue ? `已过 ${formatMinutesUntil(Math.abs(diff))}` : formatMinutesUntil(diff),
    scheduledAt: scheduledAt.toISOString(),
    minutesUntil: diff,
    overdue,
  });
}

export function getReminderItems(data: AppData, now = new Date()): ReminderItem[] {
  const items: ReminderItem[] = [];

  for (const task of data.tasks) {
    if (task.status === "done") {
      continue;
    }
    addReminder(
      items,
      task.id,
      "task",
      task.title,
      toDateTime(task.plannedDate, task.startTime ?? "09:00"),
      now,
    );
  }

  for (const workout of data.workouts) {
    addReminder(items, workout.id, "workout", workout.name, toDateTime(workout.date, "18:00"), now);
  }

  for (const meal of data.meals) {
    addReminder(
      items,
      meal.id,
      "meal",
      meal.content,
      toDateTime(meal.date, meal.time || "12:00"),
      now,
    );
  }

  for (const item of data.entertainments) {
    if (!item.plannedTime) {
      continue;
    }
    addReminder(items, item.id, "entertainment", item.name, new Date(item.plannedTime), now);
  }

  return items.sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt)).slice(0, 8);
}
