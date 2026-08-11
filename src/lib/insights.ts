import type { AppData } from "./types";

export type SmartSignal = {
  label: string;
  value: string;
};

export type SmartInsights = {
  headline: string;
  summary: string;
  signals: SmartSignal[];
  recommendations: string[];
};

function compareDateOnly(left: string, right: string): number {
  return left.localeCompare(right);
}

function recentWorkouts(data: AppData, date: string): number {
  return data.workouts.filter((workout) => compareDateOnly(workout.date, date) >= 0).length;
}

export function getSmartInsights(data: AppData, date: string): SmartInsights {
  const todayTasks = data.tasks.filter((task) => task.plannedDate === date);
  const openTodayTasks = todayTasks.filter((task) => task.status !== "done");
  const overdueTasks = data.tasks.filter(
    (task) => task.status !== "done" && compareDateOnly(task.plannedDate, date) < 0,
  );
  const highPriorityTasks = openTodayTasks.filter((task) => task.priority === "high");
  const todayMeals = data.meals.filter((meal) => meal.date === date);
  const todayWater = todayMeals.reduce((total, meal) => total + meal.waterCups, 0);
  const activeProjects = data.customProjects.filter((project) =>
    project.items.some((item) => !item.completed),
  );
  const activeEntertainment = data.entertainments.filter((item) => item.status === "active");

  const summaryParts = [
    `${todayTasks.length} 条今日计划`,
    `${overdueTasks.length} 条待补任务`,
    `${data.workouts.filter((workout) => workout.date === date).length} 条训练`,
    `${todayMeals.length} 条饮食记录`,
    `${activeProjects.length} 个进行中的自定义项目`,
  ];

  const headline =
    overdueTasks.length > 0
      ? `先处理 ${overdueTasks[0].title}`
      : highPriorityTasks.length > 0
        ? `优先推进 ${highPriorityTasks[0].title}`
        : openTodayTasks.length > 0
          ? "今天的节奏可以再收紧一点"
          : "今天的主线任务已经很平稳";

  const recommendations = [
    overdueTasks.length > 0
      ? `先把 ${overdueTasks.length} 条过期任务收进今天，减少来回切换`
      : "今天没有过期任务，可以把精力放在当前优先级最高的事情上",
    openTodayTasks.length > 4
      ? "今日计划偏多，建议拆成上午和下午两段处理"
      : "今日任务数量适中，保持现在的节奏就好",
    todayWater < 6
      ? "饮水还可以再补几杯"
      : "饮水记录比较充足，继续保持",
    recentWorkouts(data, date) === 0
      ? "今天还没有训练记录，补一组拉伸或轻量运动会更稳"
      : "训练节奏已经有记录，继续维持连续性",
    activeEntertainment.length > 0
      ? `有 ${activeEntertainment.length} 个娱乐计划正在进行，注意别挤压主任务`
      : "今天没有正在进行的娱乐计划",
  ];

  return {
    headline,
    summary: summaryParts.join("，"),
    signals: [
      { label: "今日任务", value: `${todayTasks.length}` },
      { label: "高优先级", value: `${highPriorityTasks.length}` },
      { label: "待补任务", value: `${overdueTasks.length}` },
      { label: "饮水", value: `${todayWater} 杯` },
      { label: "项目", value: `${activeProjects.length}` },
    ],
    recommendations,
  };
}
