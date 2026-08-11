import type { AppData } from "./types";
import { todayString } from "./domain.ts";

export type StatsDayPoint = {
  date: string;
  label: string;
  value: number;
  tasks: number;
  workouts: number;
  meals: number;
  memos: number;
  entertainments: number;
};

export type StatsOverview = {
  totalRecords: number;
  taskCompletionRate: number;
  todayWaterCups: number;
  weeklyActivity: StatsDayPoint[];
  moduleBreakdown: Array<{
    label: string;
    value: number;
  }>;
  recommendation: string;
};

function countDayRecords(data: AppData, date: string): StatsDayPoint {
  const tasks = data.tasks.filter((task) => task.plannedDate === date);
  const workouts = data.workouts.filter((workout) => workout.date === date);
  const meals = data.meals.filter((meal) => meal.date === date);
  const memos = data.memos.filter((memo) => memo.createdAt.startsWith(date));
  const entertainments = data.entertainments.filter((item) => item.plannedTime.startsWith(date));
  const value = tasks.length + workouts.length + meals.length + memos.length + entertainments.length;

  return {
    date,
    label: `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`,
    value,
    tasks: tasks.length,
    workouts: workouts.length,
    meals: meals.length,
    memos: memos.length,
    entertainments: entertainments.length,
  };
}

export function getStatsOverview(data: AppData, date = todayString()): StatsOverview {
  const todayTasks = data.tasks.filter((task) => task.plannedDate === date);
  const completedTodayTasks = todayTasks.filter((task) => task.status === "done").length;
  const todayMeals = data.meals.filter((meal) => meal.date === date);
  const weeklyActivity: StatsDayPoint[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(`${date}T00:00:00.000Z`);
    day.setUTCDate(day.getUTCDate() - offset);
    weeklyActivity.push(countDayRecords(data, day.toISOString().slice(0, 10)));
  }

  const totalTaskCount = data.tasks.length || 1;
  const completedTaskCount = data.tasks.filter((task) => task.status === "done").length;
  const moduleBreakdown = [
    { label: "今日计划", value: data.tasks.length },
    { label: "健身计划", value: data.workouts.length },
    { label: "饮食计划", value: data.meals.length },
    { label: "快速备忘", value: data.memos.length },
    { label: "娱乐计划", value: data.entertainments.length },
    { label: "自定义项目", value: data.customProjects.length },
  ];

  return {
    totalRecords:
      data.tasks.length +
      data.workouts.length +
      data.meals.length +
      data.memos.length +
      data.entertainments.length +
      data.customProjects.length,
    taskCompletionRate: Math.round((completedTaskCount / totalTaskCount) * 1000) / 10,
    todayWaterCups: todayMeals.reduce((total, meal) => total + meal.waterCups, 0),
    weeklyActivity,
    moduleBreakdown,
    recommendation:
      weeklyActivity.reduce((total, point) => total + point.value, 0) > 18
        ? "最近一周节奏偏满，建议给自己留一点缓冲"
        : "最近一周节奏比较平稳，可以继续维持",
  };
}
