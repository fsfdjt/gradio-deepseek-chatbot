export type Priority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "doing" | "done";
export type WorkoutType = "strength" | "cardio" | "stretch" | "other";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type EntertainmentType = "game" | "movie" | "reading" | "other";
export type EntertainmentStatus = "wishlist" | "active" | "done";

export type Task = {
  id: string;
  title: string;
  note: string;
  priority: Priority;
  status: TaskStatus;
  plannedDate: string;
  startTime: string;
  estimatedMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type Memo = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Workout = {
  id: string;
  name: string;
  type: WorkoutType;
  minutes: number;
  volume: string;
  date: string;
  completed: boolean;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type Meal = {
  id: string;
  type: MealType;
  content: string;
  waterCups: number;
  date: string;
  time: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type Entertainment = {
  id: string;
  name: string;
  type: EntertainmentType;
  status: EntertainmentStatus;
  plannedTime: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomItem = {
  id: string;
  title: string;
  note: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CustomProject = {
  id: string;
  name: string;
  description: string;
  items: CustomItem[];
  createdAt: string;
  updatedAt: string;
};

export type AppData = {
  version: 1;
  tasks: Task[];
  memos: Memo[];
  workouts: Workout[];
  meals: Meal[];
  entertainments: Entertainment[];
  customProjects: CustomProject[];
};

export type DashboardSummary = {
  todayTaskCount: number;
  doneTaskCount: number;
  openTaskCount: number;
  highPriorityOpenTasks: Task[];
  recentMemos: Memo[];
  todayWorkout: Workout | null;
  latestWorkout: Workout | null;
  todayMealCount: number;
  todayWaterCups: number;
  activeEntertainment: Entertainment[];
  recentCustomProjects: Array<{
    id: string;
    name: string;
    openItemCount: number;
  }>;
};

export type TimelineItem = {
  id: string;
  module: "today" | "fitness" | "diet" | "fun" | "memo";
  title: string;
  timeLabel: string;
  sortAt: string;
};

export type TimeRemainingPercentages = {
  day: number;
  week: number;
  month: number;
  year: number;
};
