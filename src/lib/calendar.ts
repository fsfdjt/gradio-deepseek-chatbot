import type { AppData } from "./types";

type CalendarCounts = {
  tasks: number;
  workouts: number;
  meals: number;
  memos: number;
  entertainments: number;
};

export type CalendarDay = {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  counts: CalendarCounts;
  summary: string;
};

export type CalendarMonthView = {
  year: number;
  month: number;
  label: string;
  days: CalendarDay[];
};

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function emptyCounts(): CalendarCounts {
  return { tasks: 0, workouts: 0, meals: 0, memos: 0, entertainments: 0 };
}

function countsSummary(counts: CalendarCounts): string {
  const parts: string[] = [];
  if (counts.tasks) parts.push(`${counts.tasks} 任务`);
  if (counts.workouts) parts.push(`${counts.workouts} 训练`);
  if (counts.meals) parts.push(`${counts.meals} 饮食`);
  if (counts.memos) parts.push(`${counts.memos} 备忘`);
  if (counts.entertainments) parts.push(`${counts.entertainments} 娱乐`);
  return parts.length ? parts.join("，") : "当天没有记录";
}

export function getMonthCalendar(data: AppData, cursor = new Date()): CalendarMonthView {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthStart = new Date(year, month, 1);
  const gridStart = new Date(monthStart);
  const mondayOffset = (gridStart.getDay() + 6) % 7;
  gridStart.setDate(gridStart.getDate() - mondayOffset);

  const days: CalendarDay[] = [];
  for (let index = 0; index < 42; index += 1) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    const date = toDateKey(day);
    const counts = emptyCounts();

    counts.tasks = data.tasks.filter((task) => task.plannedDate === date).length;
    counts.workouts = data.workouts.filter((workout) => workout.date === date).length;
    counts.meals = data.meals.filter((meal) => meal.date === date).length;
    counts.memos = data.memos.filter((memo) => memo.createdAt.startsWith(date)).length;
    counts.entertainments = data.entertainments.filter((item) =>
      item.plannedTime.startsWith(date),
    ).length;

    days.push({
      date,
      dayOfMonth: day.getDate(),
      isCurrentMonth: day.getMonth() === month,
      isToday: date === toDateKey(new Date()),
      counts,
      summary: countsSummary(counts),
    });
  }

  return {
    year,
    month,
    label: `${year} 年 ${month + 1} 月`,
    days,
  };
}
