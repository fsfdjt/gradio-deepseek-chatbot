import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { addMeal, addWorkout, createEmptyData } from "../src/lib/domain.ts";
import { estimateWorkoutCalories, getNutritionOverview } from "../src/lib/nutrition.ts";

const clock = () => "2026-08-09T09:00:00.000Z";

test("nutrition overview estimates intake macros and workout calories", () => {
  let data = createEmptyData();
  data = addMeal(data, { id: "meal-1", content: "鸡胸肉米饭", date: "2026-08-09" }, clock);
  data = addMeal(data, { id: "meal-2", content: "水果酸奶", date: "2026-08-09" }, clock);
  data = addWorkout(
    data,
    { id: "workout-1", name: "慢跑", type: "cardio", minutes: 30, date: "2026-08-09" },
    clock,
  );

  const overview = getNutritionOverview(data, "2026-08-09", 70);

  assert.ok(overview.intake.calories > 0);
  assert.ok(overview.intake.protein > 0);
  assert.ok(overview.burnedCalories > 0);
  assert.equal(overview.workoutMinutes, 30);
  assert.equal(estimateWorkoutCalories(data.workouts[0], 70), overview.burnedCalories);
});

test("stats page renders nutrition and exercise estimates", () => {
  const source = readFileSync("src/App.tsx", "utf8");

  assert.match(source, /getNutritionOverview/);
  assert.match(source, /营养与运动估算/);
  assert.match(source, /摄入热量/);
  assert.match(source, /蛋白质/);
  assert.match(source, /macro-grid/);
});
