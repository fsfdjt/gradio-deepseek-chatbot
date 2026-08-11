import type { AppData, Meal, Workout, WorkoutType } from "./types";
import { todayString } from "./domain.ts";

export type NutritionEstimate = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type NutritionOverview = {
  intake: NutritionEstimate;
  burnedCalories: number;
  netCalories: number;
  workoutMinutes: number;
  note: string;
};

const mealKeywordTable: Array<{
  keywords: string[];
  estimate: NutritionEstimate;
}> = [
  { keywords: ["鸡", "牛肉", "鱼", "蛋", "虾", "肉"], estimate: { calories: 320, protein: 30, carbs: 8, fat: 14 } },
  { keywords: ["米", "面", "饭", "粉", "粥", "燕麦"], estimate: { calories: 380, protein: 10, carbs: 72, fat: 6 } },
  { keywords: ["沙拉", "蔬菜", "水果"], estimate: { calories: 180, protein: 5, carbs: 28, fat: 5 } },
  { keywords: ["奶", "酸奶", "豆浆"], estimate: { calories: 160, protein: 9, carbs: 16, fat: 6 } },
  { keywords: ["零食", "甜", "蛋糕", "奶茶", "饮料"], estimate: { calories: 420, protein: 4, carbs: 62, fat: 16 } },
];

const defaultMealEstimate: NutritionEstimate = {
  calories: 280,
  protein: 12,
  carbs: 38,
  fat: 9,
};

const workoutMet: Record<WorkoutType, number> = {
  strength: 5.5,
  cardio: 7.5,
  stretch: 2.8,
  other: 4,
};

function addEstimate(left: NutritionEstimate, right: NutritionEstimate): NutritionEstimate {
  return {
    calories: left.calories + right.calories,
    protein: left.protein + right.protein,
    carbs: left.carbs + right.carbs,
    fat: left.fat + right.fat,
  };
}

export function estimateMealNutrition(meal: Meal): NutritionEstimate {
  const matched = mealKeywordTable.find((row) =>
    row.keywords.some((keyword) => meal.content.includes(keyword)),
  );
  return matched?.estimate ?? defaultMealEstimate;
}

export function estimateWorkoutCalories(workout: Workout, bodyWeightKg = 70): number {
  const met = workoutMet[workout.type];
  return Math.round(((met * 3.5 * bodyWeightKg) / 200) * workout.minutes);
}

export function getNutritionOverview(
  data: AppData,
  date = todayString(),
  bodyWeightKg = 70,
): NutritionOverview {
  const todayMeals = data.meals.filter((meal) => meal.date === date);
  const todayWorkouts = data.workouts.filter((workout) => workout.date === date);
  const intake = todayMeals
    .map(estimateMealNutrition)
    .reduce(addEstimate, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const burnedCalories = todayWorkouts.reduce(
    (total, workout) => total + estimateWorkoutCalories(workout, bodyWeightKg),
    0,
  );
  const workoutMinutes = todayWorkouts.reduce((total, workout) => total + workout.minutes, 0);
  const netCalories = intake.calories - burnedCalories;

  return {
    intake,
    burnedCalories,
    netCalories,
    workoutMinutes,
    note:
      todayMeals.length === 0
        ? "今天还没有饮食记录，估算会随着记录增加而更新"
        : "这是基于关键词和训练类型的粗略估算，仅用于日常参考",
  };
}
