import type {
  AppData,
  CustomItem,
  CustomProject,
  DashboardSummary,
  Entertainment,
  Meal,
  Memo,
  Priority,
  Task,
  TaskStatus,
  Workout,
} from "./types";

type Clock = () => string;

const nowIso: Clock = () => new Date().toISOString();

export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function todayString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function createEmptyData(): AppData {
  return {
    version: 1,
    tasks: [],
    memos: [],
    workouts: [],
    meals: [],
    entertainments: [],
    customProjects: [],
  };
}

export function addTask(
  data: AppData,
  input: Partial<Task> & { title: string },
  clock: Clock = nowIso,
): AppData {
  const timestamp = clock();
  const task: Task = {
    id: input.id ?? createId("task"),
    title: input.title.trim(),
    note: input.note ?? "",
    priority: input.priority ?? "medium",
    status: input.status ?? "todo",
    plannedDate: input.plannedDate ?? todayString(),
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };

  if (!task.title) {
    throw new Error("任务标题不能为空。");
  }

  return { ...data, tasks: [task, ...data.tasks] };
}

export function updateTask(
  data: AppData,
  id: string,
  patch: Partial<Omit<Task, "id" | "createdAt">>,
  clock: Clock = nowIso,
): AppData {
  return {
    ...data,
    tasks: data.tasks.map((task) =>
      task.id === id ? { ...task, ...patch, updatedAt: clock() } : task,
    ),
  };
}

export function deleteTask(data: AppData, id: string): AppData {
  return { ...data, tasks: data.tasks.filter((task) => task.id !== id) };
}

export function setTaskDone(
  data: AppData,
  id: string,
  done: boolean,
  clock: Clock = nowIso,
): AppData {
  return updateTask(data, id, { status: done ? "done" : "todo" }, clock);
}

export function filterTasks(
  tasks: Task[],
  status: "all" | TaskStatus,
): Task[] {
  if (status === "all") {
    return tasks;
  }
  return tasks.filter((task) => task.status === status);
}

export function addMemo(
  data: AppData,
  input: Partial<Memo> & { content: string },
  clock: Clock = nowIso,
): AppData {
  const timestamp = clock();
  const memo: Memo = {
    id: input.id ?? createId("memo"),
    content: input.content.trim(),
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };

  if (!memo.content) {
    throw new Error("备忘内容不能为空。");
  }

  return { ...data, memos: [memo, ...data.memos] };
}

export function updateMemo(
  data: AppData,
  id: string,
  content: string,
  clock: Clock = nowIso,
): AppData {
  return {
    ...data,
    memos: data.memos.map((memo) =>
      memo.id === id ? { ...memo, content: content.trim(), updatedAt: clock() } : memo,
    ),
  };
}

export function deleteMemo(data: AppData, id: string): AppData {
  return { ...data, memos: data.memos.filter((memo) => memo.id !== id) };
}

export function addWorkout(
  data: AppData,
  input: Partial<Workout> & { name: string },
  clock: Clock = nowIso,
): AppData {
  const timestamp = clock();
  const workout: Workout = {
    id: input.id ?? createId("workout"),
    name: input.name.trim(),
    type: input.type ?? "strength",
    minutes: Math.max(0, Number(input.minutes ?? 0)),
    volume: input.volume ?? "",
    date: input.date ?? todayString(),
    completed: input.completed ?? false,
    note: input.note ?? "",
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };

  if (!workout.name) {
    throw new Error("训练名称不能为空。");
  }

  return { ...data, workouts: [workout, ...data.workouts] };
}

export function updateWorkout(
  data: AppData,
  id: string,
  patch: Partial<Omit<Workout, "id" | "createdAt">>,
  clock: Clock = nowIso,
): AppData {
  return {
    ...data,
    workouts: data.workouts.map((workout) =>
      workout.id === id ? { ...workout, ...patch, updatedAt: clock() } : workout,
    ),
  };
}

export function deleteWorkout(data: AppData, id: string): AppData {
  return { ...data, workouts: data.workouts.filter((workout) => workout.id !== id) };
}

export function addMeal(
  data: AppData,
  input: Partial<Meal> & { content: string },
  clock: Clock = nowIso,
): AppData {
  const timestamp = clock();
  const meal: Meal = {
    id: input.id ?? createId("meal"),
    type: input.type ?? "breakfast",
    content: input.content.trim(),
    waterCups: Math.max(0, Number(input.waterCups ?? 0)),
    date: input.date ?? todayString(),
    time: input.time ?? "12:00",
    note: input.note ?? "",
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };

  if (!meal.content) {
    throw new Error("餐食内容不能为空。");
  }

  return { ...data, meals: [meal, ...data.meals] };
}

export function updateMeal(
  data: AppData,
  id: string,
  patch: Partial<Omit<Meal, "id" | "createdAt">>,
  clock: Clock = nowIso,
): AppData {
  return {
    ...data,
    meals: data.meals.map((meal) =>
      meal.id === id ? { ...meal, ...patch, updatedAt: clock() } : meal,
    ),
  };
}

export function deleteMeal(data: AppData, id: string): AppData {
  return { ...data, meals: data.meals.filter((meal) => meal.id !== id) };
}

export function addEntertainment(
  data: AppData,
  input: Partial<Entertainment> & { name: string },
  clock: Clock = nowIso,
): AppData {
  const timestamp = clock();
  const entertainment: Entertainment = {
    id: input.id ?? createId("entertainment"),
    name: input.name.trim(),
    type: input.type ?? "game",
    status: input.status ?? "wishlist",
    plannedTime: input.plannedTime ?? "",
    note: input.note ?? "",
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };

  if (!entertainment.name) {
    throw new Error("娱乐计划名称不能为空。");
  }

  return { ...data, entertainments: [entertainment, ...data.entertainments] };
}

export function updateEntertainment(
  data: AppData,
  id: string,
  patch: Partial<Omit<Entertainment, "id" | "createdAt">>,
  clock: Clock = nowIso,
): AppData {
  return {
    ...data,
    entertainments: data.entertainments.map((item) =>
      item.id === id ? { ...item, ...patch, updatedAt: clock() } : item,
    ),
  };
}

export function deleteEntertainment(data: AppData, id: string): AppData {
  return {
    ...data,
    entertainments: data.entertainments.filter((item) => item.id !== id),
  };
}

export function addCustomProject(
  data: AppData,
  input: Partial<CustomProject> & { name: string },
  clock: Clock = nowIso,
): AppData {
  const timestamp = clock();
  const project: CustomProject = {
    id: input.id ?? createId("project"),
    name: input.name.trim(),
    description: input.description ?? "",
    items: input.items ?? [],
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };

  if (!project.name) {
    throw new Error("项目名称不能为空。");
  }

  return { ...data, customProjects: [project, ...data.customProjects] };
}

export function updateCustomProject(
  data: AppData,
  id: string,
  patch: Partial<Omit<CustomProject, "id" | "createdAt" | "items">>,
  clock: Clock = nowIso,
): AppData {
  return {
    ...data,
    customProjects: data.customProjects.map((project) =>
      project.id === id ? { ...project, ...patch, updatedAt: clock() } : project,
    ),
  };
}

export function deleteCustomProject(data: AppData, id: string): AppData {
  return {
    ...data,
    customProjects: data.customProjects.filter((project) => project.id !== id),
  };
}

export function addCustomItem(
  data: AppData,
  projectId: string,
  input: Partial<CustomItem> & { title: string },
  clock: Clock = nowIso,
): AppData {
  const timestamp = clock();
  const item: CustomItem = {
    id: input.id ?? createId("item"),
    title: input.title.trim(),
    note: input.note ?? "",
    completed: input.completed ?? false,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };

  if (!item.title) {
    throw new Error("条目标题不能为空。");
  }

  return {
    ...data,
    customProjects: data.customProjects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            items: [item, ...project.items],
            updatedAt: timestamp,
          }
        : project,
    ),
  };
}

export function updateCustomItem(
  data: AppData,
  projectId: string,
  itemId: string,
  patch: Partial<Omit<CustomItem, "id" | "createdAt">>,
  clock: Clock = nowIso,
): AppData {
  const timestamp = clock();
  return {
    ...data,
    customProjects: data.customProjects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            items: project.items.map((item) =>
              item.id === itemId ? { ...item, ...patch, updatedAt: timestamp } : item,
            ),
            updatedAt: timestamp,
          }
        : project,
    ),
  };
}

export function deleteCustomItem(
  data: AppData,
  projectId: string,
  itemId: string,
  clock: Clock = nowIso,
): AppData {
  const timestamp = clock();
  return {
    ...data,
    customProjects: data.customProjects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            items: project.items.filter((item) => item.id !== itemId),
            updatedAt: timestamp,
          }
        : project,
    ),
  };
}

export function getDashboardSummary(
  data: AppData,
  date = todayString(),
): DashboardSummary {
  const todayTasks = data.tasks.filter((task) => task.plannedDate === date);
  const doneTaskCount = todayTasks.filter((task) => task.status === "done").length;
  const todayWorkouts = data.workouts.filter((workout) => workout.date === date);
  const todayMeals = data.meals.filter((meal) => meal.date === date);

  return {
    todayTaskCount: todayTasks.length,
    doneTaskCount,
    openTaskCount: todayTasks.length - doneTaskCount,
    highPriorityOpenTasks: todayTasks
      .filter((task) => task.priority === "high" && task.status !== "done")
      .slice(0, 3),
    recentMemos: [...data.memos]
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, 3),
    todayWorkout: todayWorkouts[0] ?? null,
    latestWorkout:
      [...data.workouts].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      )[0] ?? null,
    todayMealCount: todayMeals.length,
    todayWaterCups: todayMeals.reduce((total, meal) => total + meal.waterCups, 0),
    activeEntertainment: data.entertainments
      .filter((item) => item.status === "active")
      .slice(0, 3),
    recentCustomProjects: [...data.customProjects]
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, 3)
      .map((project) => ({
        id: project.id,
        name: project.name,
        openItemCount: project.items.filter((item) => !item.completed).length,
      })),
  };
}

export function priorityLabel(priority: Priority): string {
  return { high: "高", medium: "中", low: "低" }[priority];
}

export function statusLabel(status: TaskStatus): string {
  return { todo: "未完成", doing: "进行中", done: "已完成" }[status];
}
