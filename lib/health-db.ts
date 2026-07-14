import {
  defaultHealthProfile,
  seedDailyLogs,
  seedExercises,
  seedGroceryLists,
  seedHealthData,
  seedMealPlan,
  seedPantry,
  seedProgress,
  seedRecipes,
  seedReminders,
  seedWorkoutPlans,
  seedWorkoutSessions,
  type DailyLog,
  type Exercise,
  type GroceryItem,
  type GroceryList,
  type HealthData,
  type HealthProfile,
  type HealthReminder,
  type MealPlanEntry,
  type PantryItem,
  type ProgressEntry,
  type ProgressPhoto,
  type Recipe,
  type WorkoutPlan,
  type WorkoutSession
} from "@/data/health";
import { generateGroceryItemsFromMeals } from "@/lib/health-calculations";
import { createId, getD1Database } from "@/lib/d1";
import { getR2Bucket } from "@/lib/r2-storage";

function db() {
  return getD1Database();
}

function bool(value: boolean) {
  return value ? 1 : 0;
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  try {
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

type ProfileRow = Omit<HealthProfile, "nutritionTargets" | "weddingDate" | "startingDate" | "startingWeight" | "currentWeight" | "goalWeight" | "waistGoal" | "workoutGoalPerWeek" | "customGoalTitle"> & {
  wedding_date: string;
  starting_date: string;
  starting_weight: number;
  current_weight: number;
  goal_weight: number;
  waist_goal: number;
  workout_goal_per_week: number;
  custom_goal_title: string;
  nutrition_targets: string;
};

type ExerciseRow = {
  id: string; name: string; description: string | null; instructions: string | null; primary_muscle: string | null; secondary_muscles: string | null; equipment: string | null; exercise_type: string | null; movement_pattern: string | null; difficulty: Exercise["difficulty"]; tracking_type: Exercise["trackingType"]; favorite: number; custom: number; archived: number;
};

type PlanRow = {
  id: string; name: string; description: string | null; goal: string | null; level: string | null; days_per_week: number; duration_minutes: number; equipment: string | null; structure: string | null; active: number; archived: number; scheduled_days: string | null; notes: string | null;
};

type SessionRow = {
  id: string; plan_id: string | null; plan_name: string | null; workout_name: string; status: WorkoutSession["status"]; started_at: string | null; completed_at: string | null; duration_minutes: number | null; notes: string | null; perceived_difficulty: number | null; energy: number | null; exercises: string | null;
};

type RecipeRow = {
  id: string; name: string; description: string | null; meal_type: Recipe["mealType"]; cuisine: string | null; ingredients: string | null; instructions: string | null; prep_minutes: number | null; cook_minutes: number | null; servings: number | null; serving_size: string | null; calories: number | null; protein: number | null; carbohydrates: number | null; fat: number | null; fiber: number | null; sodium: number | null; tags: string | null; allergens: string | null; favorite: number; rating: number | null; ai_generated: number; nutrition_verified: number; archived: number;
};

type MealRow = {
  id: string; date: string; slot: MealPlanEntry["slot"]; recipe_id: string | null; recipe_name: string; servings: number; eaten: number; locked: number;
};

type LogRow = {
  id: string; date: string; calories: number; protein: number; carbohydrates: number; fat: number; fiber: number; sodium: number; water_oz: number; steps: number; weight: number | null; notes: string | null;
};

type GroceryListRow = { id: string; name: string; status: GroceryList["status"] };
type GroceryItemRow = { id: string; list_id: string; name: string; quantity: number; unit: string | null; section: string | null; checked: number; already_have: number; add_to_pantry: number; notes: string | null };
type PantryRow = { id: string; name: string; quantity: number; unit: string | null; category: string | null; purchase_date: string | null; expiration_date: string | null; low_stock: number; staple: number; notes: string | null };
type ProgressRow = { id: string; date: string; weight: number; waist: number | null; chest: number | null; arms: number | null; hips: number | null; thighs: number | null; body_fat: number | null; resting_heart_rate: number | null; steps: number | null; sleep_hours: number | null; water_oz: number | null; mood: string | null; energy: number | null; notes: string | null };
type PhotoRow = { id: string; date: string; angle: ProgressPhoto["angle"]; weight: number | null; notes: string | null; r2_key: string };
type ReminderRow = { id: string; type: string; enabled: number; cadence: string | null; time: string | null };

function toProfile(row: ProfileRow): HealthProfile {
  return {
    id: row.id,
    weddingDate: row.wedding_date,
    startingDate: row.starting_date,
    startingWeight: row.starting_weight,
    currentWeight: row.current_weight,
    goalWeight: row.goal_weight,
    waistGoal: row.waist_goal,
    workoutGoalPerWeek: row.workout_goal_per_week,
    customGoalTitle: row.custom_goal_title,
    units: row.units,
    nutritionTargets: parseJson(row.nutrition_targets, defaultHealthProfile.nutritionTargets)
  };
}

function toExercise(row: ExerciseRow): Exercise {
  return { id: row.id, name: row.name, description: row.description ?? "", instructions: row.instructions ?? "", primaryMuscle: row.primary_muscle ?? "", secondaryMuscles: parseJson(row.secondary_muscles, []), equipment: row.equipment ?? "", exerciseType: row.exercise_type ?? "", movementPattern: row.movement_pattern ?? "", difficulty: row.difficulty, trackingType: row.tracking_type, favorite: Boolean(row.favorite), custom: Boolean(row.custom), archived: Boolean(row.archived) };
}

function toPlan(row: PlanRow): WorkoutPlan {
  return { id: row.id, name: row.name, description: row.description ?? "", goal: row.goal ?? "", level: row.level ?? "", daysPerWeek: row.days_per_week, durationMinutes: row.duration_minutes, equipment: row.equipment ?? "", structure: row.structure ?? "", active: Boolean(row.active), archived: Boolean(row.archived), scheduledDays: parseJson(row.scheduled_days, []), notes: row.notes ?? "" };
}

function toSession(row: SessionRow): WorkoutSession {
  return { id: row.id, planId: row.plan_id ?? "", planName: row.plan_name ?? "", workoutName: row.workout_name, status: row.status, startedAt: row.started_at ?? "", completedAt: row.completed_at ?? "", durationMinutes: row.duration_minutes ?? 0, notes: row.notes ?? "", perceivedDifficulty: row.perceived_difficulty ?? 0, energy: row.energy ?? 0, exercises: parseJson(row.exercises, []) };
}

function toRecipe(row: RecipeRow): Recipe {
  return { id: row.id, name: row.name, description: row.description ?? "", mealType: row.meal_type, cuisine: row.cuisine ?? "", ingredients: parseJson(row.ingredients, []), instructions: parseJson(row.instructions, []), prepMinutes: row.prep_minutes ?? 0, cookMinutes: row.cook_minutes ?? 0, servings: row.servings ?? 1, servingSize: row.serving_size ?? "", calories: row.calories ?? 0, protein: row.protein ?? 0, carbohydrates: row.carbohydrates ?? 0, fat: row.fat ?? 0, fiber: row.fiber ?? 0, sodium: row.sodium ?? 0, tags: parseJson(row.tags, []), allergens: parseJson(row.allergens, []), favorite: Boolean(row.favorite), rating: row.rating ?? 0, aiGenerated: Boolean(row.ai_generated), nutritionVerified: Boolean(row.nutrition_verified), archived: Boolean(row.archived) };
}

function toMeal(row: MealRow): MealPlanEntry {
  return { id: row.id, date: row.date, slot: row.slot, recipeId: row.recipe_id ?? "", recipeName: row.recipe_name, servings: row.servings, eaten: Boolean(row.eaten), locked: Boolean(row.locked) };
}

function toLog(row: LogRow): DailyLog {
  return { id: row.id, date: row.date, calories: row.calories, protein: row.protein, carbohydrates: row.carbohydrates, fat: row.fat, fiber: row.fiber, sodium: row.sodium, waterOz: row.water_oz, steps: row.steps, weight: row.weight ?? 0, notes: row.notes ?? "" };
}

function toGroceryItem(row: GroceryItemRow): GroceryItem {
  return { id: row.id, listId: row.list_id, name: row.name, quantity: row.quantity, unit: row.unit ?? "", section: row.section ?? "Other", checked: Boolean(row.checked), alreadyHave: Boolean(row.already_have), addToPantry: Boolean(row.add_to_pantry), notes: row.notes ?? "" };
}

function toPantry(row: PantryRow): PantryItem {
  return { id: row.id, name: row.name, quantity: row.quantity, unit: row.unit ?? "", category: row.category ?? "Other", purchaseDate: row.purchase_date ?? "", expirationDate: row.expiration_date ?? "", lowStock: Boolean(row.low_stock), staple: Boolean(row.staple), notes: row.notes ?? "" };
}

function toProgress(row: ProgressRow): ProgressEntry {
  return { id: row.id, date: row.date, weight: row.weight, waist: row.waist ?? 0, chest: row.chest ?? 0, arms: row.arms ?? 0, hips: row.hips ?? 0, thighs: row.thighs ?? 0, bodyFat: row.body_fat ?? 0, restingHeartRate: row.resting_heart_rate ?? 0, steps: row.steps ?? 0, sleepHours: row.sleep_hours ?? 0, waterOz: row.water_oz ?? 0, mood: row.mood ?? "", energy: row.energy ?? 0, notes: row.notes ?? "" };
}

function toPhoto(row: PhotoRow): ProgressPhoto {
  return { id: row.id, date: row.date, angle: row.angle, weight: row.weight ?? 0, notes: row.notes ?? "", url: `/api/health/photos/${row.id}` };
}

function toReminder(row: ReminderRow): HealthReminder {
  return { id: row.id, type: row.type, enabled: Boolean(row.enabled), cadence: row.cadence ?? "", time: row.time ?? "" };
}

export async function ensureHealthSeeded() {
  const database = db();
  if (!database) return;

  const existing = await database.prepare("SELECT id FROM health_profiles WHERE id = ?").bind(defaultHealthProfile.id).first<{ id: string }>().catch(() => null);
  if (existing) return;

  await database.prepare("INSERT INTO health_profiles (id, wedding_date, starting_date, starting_weight, current_weight, goal_weight, waist_goal, workout_goal_per_week, custom_goal_title, units, nutrition_targets) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(defaultHealthProfile.id, defaultHealthProfile.weddingDate, defaultHealthProfile.startingDate, defaultHealthProfile.startingWeight, defaultHealthProfile.currentWeight, defaultHealthProfile.goalWeight, defaultHealthProfile.waistGoal, defaultHealthProfile.workoutGoalPerWeek, defaultHealthProfile.customGoalTitle, defaultHealthProfile.units, JSON.stringify(defaultHealthProfile.nutritionTargets)).run();

  for (const exercise of seedExercises) await createExercise(exercise);
  for (const plan of seedWorkoutPlans) await createWorkoutPlan(plan);
  for (const session of seedWorkoutSessions) await createWorkoutSession(session);
  for (const recipe of seedRecipes) await createRecipe(recipe);
  for (const meal of seedMealPlan) await createMealPlanEntry(meal);
  for (const log of seedDailyLogs) await upsertDailyLog(log);
  for (const list of seedGroceryLists) await createGroceryList(list);
  for (const item of seedPantry) await createPantryItem(item);
  for (const entry of seedProgress) await createProgressEntry(entry);
  for (const reminder of seedReminders) await upsertReminder(reminder);
}

export async function getHealthData(): Promise<HealthData> {
  const database = db();
  if (!database) return seedHealthData;

  try {
    await ensureHealthSeeded();
    const profileRow = await database.prepare("SELECT * FROM health_profiles WHERE id = ?").bind(defaultHealthProfile.id).first<ProfileRow>();
    const { results: exerciseRows = [] } = await database.prepare("SELECT * FROM health_exercises ORDER BY favorite DESC, name ASC").all<ExerciseRow>();
    const { results: planRows = [] } = await database.prepare("SELECT * FROM health_workout_plans ORDER BY active DESC, name ASC").all<PlanRow>();
    const { results: sessionRows = [] } = await database.prepare("SELECT * FROM health_workout_sessions ORDER BY created_at DESC").all<SessionRow>();
    const { results: recipeRows = [] } = await database.prepare("SELECT * FROM health_recipes WHERE archived = 0 ORDER BY favorite DESC, name ASC").all<RecipeRow>();
    const { results: mealRows = [] } = await database.prepare("SELECT * FROM health_meal_plan_entries ORDER BY date ASC, slot ASC").all<MealRow>();
    const { results: logRows = [] } = await database.prepare("SELECT * FROM health_daily_logs ORDER BY date DESC LIMIT 90").all<LogRow>();
    const { results: listRows = [] } = await database.prepare("SELECT * FROM health_grocery_lists WHERE status = 'active' ORDER BY created_at DESC").all<GroceryListRow>();
    const { results: itemRows = [] } = await database.prepare("SELECT * FROM health_grocery_items ORDER BY checked ASC, section ASC, name ASC").all<GroceryItemRow>();
    const { results: pantryRows = [] } = await database.prepare("SELECT * FROM health_pantry_items ORDER BY low_stock DESC, expiration_date ASC").all<PantryRow>();
    const { results: progressRows = [] } = await database.prepare("SELECT * FROM health_progress_entries ORDER BY date DESC LIMIT 180").all<ProgressRow>();
    const { results: photoRows = [] } = await database.prepare("SELECT * FROM health_progress_photos ORDER BY date DESC LIMIT 60").all<PhotoRow>();
    const { results: reminderRows = [] } = await database.prepare("SELECT * FROM health_reminders ORDER BY type ASC").all<ReminderRow>();

    const groceryItems = itemRows.map(toGroceryItem);
    return {
      profile: profileRow ? toProfile(profileRow) : defaultHealthProfile,
      exercises: exerciseRows.map(toExercise),
      workoutPlans: planRows.map(toPlan),
      workoutSessions: sessionRows.map(toSession),
      recipes: recipeRows.map(toRecipe),
      mealPlan: mealRows.map(toMeal),
      dailyLogs: logRows.map(toLog),
      groceryLists: listRows.map((row) => ({ id: row.id, name: row.name, status: row.status, items: groceryItems.filter((item) => item.listId === row.id) })),
      pantry: pantryRows.map(toPantry),
      progress: progressRows.map(toProgress),
      progressPhotos: photoRows.map(toPhoto),
      reminders: reminderRows.map(toReminder)
    };
  } catch {
    return seedHealthData;
  }
}

export async function createExercise(input: Partial<Exercise>) {
  const database = db();
  const exercise: Exercise = { ...seedExercises[0], ...input, id: input.id ?? createId("exercise"), name: input.name?.trim() || "Custom exercise", custom: input.custom ?? true };
  if (!database) return exercise;
  await database.prepare("INSERT OR REPLACE INTO health_exercises (id, name, description, instructions, primary_muscle, secondary_muscles, equipment, exercise_type, movement_pattern, difficulty, tracking_type, favorite, custom, archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(exercise.id, exercise.name, exercise.description, exercise.instructions, exercise.primaryMuscle, JSON.stringify(exercise.secondaryMuscles), exercise.equipment, exercise.exerciseType, exercise.movementPattern, exercise.difficulty, exercise.trackingType, bool(exercise.favorite), bool(exercise.custom), bool(exercise.archived)).run();
  return exercise;
}

export async function createWorkoutPlan(input: Partial<WorkoutPlan>) {
  const database = db();
  const plan: WorkoutPlan = { ...seedWorkoutPlans[0], ...input, id: input.id ?? createId("plan"), name: input.name?.trim() || "New workout plan" };
  if (!database) return plan;
  if (plan.active) await database.prepare("UPDATE health_workout_plans SET active = 0").run();
  await database.prepare("INSERT OR REPLACE INTO health_workout_plans (id, name, description, goal, level, days_per_week, duration_minutes, equipment, structure, active, archived, scheduled_days, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(plan.id, plan.name, plan.description, plan.goal, plan.level, plan.daysPerWeek, plan.durationMinutes, plan.equipment, plan.structure, bool(plan.active), bool(plan.archived), JSON.stringify(plan.scheduledDays), plan.notes).run();
  return plan;
}

export async function createWorkoutSession(input: Partial<WorkoutSession>) {
  const database = db();
  const base = seedWorkoutSessions[0];
  const session: WorkoutSession = { ...base, ...input, id: input.id ?? createId("session"), workoutName: input.workoutName?.trim() || base.workoutName };
  if (!database) return session;
  await database.prepare("INSERT OR REPLACE INTO health_workout_sessions (id, plan_id, plan_name, workout_name, status, started_at, completed_at, duration_minutes, notes, perceived_difficulty, energy, exercises) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(session.id, session.planId, session.planName, session.workoutName, session.status, session.startedAt, session.completedAt, session.durationMinutes, session.notes, session.perceivedDifficulty, session.energy, JSON.stringify(session.exercises)).run();
  return session;
}

export async function updateWorkoutSession(id: string, input: Partial<WorkoutSession>) {
  const data = await getHealthData();
  const existing = data.workoutSessions.find((session) => session.id === id) ?? seedWorkoutSessions[0];
  return createWorkoutSession({ ...existing, ...input, id });
}

export async function createRecipe(input: Partial<Recipe>) {
  const database = db();
  const recipe: Recipe = { ...seedRecipes[0], ...input, id: input.id ?? createId("recipe"), name: input.name?.trim() || "New recipe", aiGenerated: input.aiGenerated ?? false, nutritionVerified: input.nutritionVerified ?? false };
  if (!database) return recipe;
  await database.prepare("INSERT OR REPLACE INTO health_recipes (id, name, description, meal_type, cuisine, ingredients, instructions, prep_minutes, cook_minutes, servings, serving_size, calories, protein, carbohydrates, fat, fiber, sodium, tags, allergens, favorite, rating, ai_generated, nutrition_verified, archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(recipe.id, recipe.name, recipe.description, recipe.mealType, recipe.cuisine, JSON.stringify(recipe.ingredients), JSON.stringify(recipe.instructions), recipe.prepMinutes, recipe.cookMinutes, recipe.servings, recipe.servingSize, recipe.calories, recipe.protein, recipe.carbohydrates, recipe.fat, recipe.fiber, recipe.sodium, JSON.stringify(recipe.tags), JSON.stringify(recipe.allergens), bool(recipe.favorite), recipe.rating, bool(recipe.aiGenerated), bool(recipe.nutritionVerified), bool(recipe.archived)).run();
  return recipe;
}

export async function createMealPlanEntry(input: Partial<MealPlanEntry>) {
  const database = db();
  const entry: MealPlanEntry = { id: input.id ?? createId("meal"), date: input.date ?? new Date().toISOString().slice(0, 10), slot: input.slot ?? "Dinner", recipeId: input.recipeId ?? "", recipeName: input.recipeName?.trim() || "Custom meal", servings: Number(input.servings ?? 1), eaten: input.eaten ?? false, locked: input.locked ?? false };
  if (!database) return entry;
  await database.prepare("INSERT OR REPLACE INTO health_meal_plan_entries (id, date, slot, recipe_id, recipe_name, servings, eaten, locked) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(entry.id, entry.date, entry.slot, entry.recipeId, entry.recipeName, entry.servings, bool(entry.eaten), bool(entry.locked)).run();
  return entry;
}

export async function upsertDailyLog(input: Partial<DailyLog>) {
  const database = db();
  const log: DailyLog = { ...seedDailyLogs[0], ...input, id: input.id ?? `log-${input.date ?? new Date().toISOString().slice(0, 10)}`, date: input.date ?? new Date().toISOString().slice(0, 10) };
  if (!database) return log;
  await database.prepare("INSERT INTO health_daily_logs (id, date, calories, protein, carbohydrates, fat, fiber, sodium, water_oz, steps, weight, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(date) DO UPDATE SET calories = excluded.calories, protein = excluded.protein, carbohydrates = excluded.carbohydrates, fat = excluded.fat, fiber = excluded.fiber, sodium = excluded.sodium, water_oz = excluded.water_oz, steps = excluded.steps, weight = excluded.weight, notes = excluded.notes, updated_at = CURRENT_TIMESTAMP").bind(log.id, log.date, log.calories, log.protein, log.carbohydrates, log.fat, log.fiber, log.sodium, log.waterOz, log.steps, log.weight, log.notes).run();
  return log;
}

export async function createGroceryList(input: Partial<GroceryList>) {
  const database = db();
  const list: GroceryList = { id: input.id ?? createId("grocery"), name: input.name?.trim() || "Grocery list", status: input.status ?? "active", items: input.items ?? [] };
  if (!database) return list;
  await database.prepare("INSERT OR REPLACE INTO health_grocery_lists (id, name, status) VALUES (?, ?, ?)").bind(list.id, list.name, list.status).run();
  return list;
}

export async function createGroceryItem(input: Partial<GroceryItem>) {
  const database = db();
  const item: GroceryItem = { id: input.id ?? createId("grocery-item"), listId: input.listId ?? "grocery-weekly", name: input.name?.trim() || "Item", quantity: Number(input.quantity ?? 1), unit: input.unit ?? "", section: input.section ?? "Other", checked: input.checked ?? false, alreadyHave: input.alreadyHave ?? false, addToPantry: input.addToPantry ?? false, notes: input.notes ?? "" };
  if (!database) return item;
  await database.prepare("INSERT OR REPLACE INTO health_grocery_items (id, list_id, name, quantity, unit, section, checked, already_have, add_to_pantry, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(item.id, item.listId, item.name, item.quantity, item.unit, item.section, bool(item.checked), bool(item.alreadyHave), bool(item.addToPantry), item.notes).run();
  return item;
}

export async function generateGroceryListFromMealPlan() {
  const data = await getHealthData();
  const list = data.groceryLists[0] ?? await createGroceryList({ id: "grocery-weekly", name: "Weekly groceries" });
  const ingredients = generateGroceryItemsFromMeals(data.mealPlan, data.recipes);

  for (const ingredient of ingredients) {
    await createGroceryItem({ listId: list.id, name: ingredient.name, quantity: ingredient.quantity, unit: ingredient.unit, section: ingredient.section });
  }

  return getHealthData();
}

export async function toggleGroceryItem(id: string, checked: boolean) {
  const database = db();
  if (!database) return true;
  await database.prepare("UPDATE health_grocery_items SET checked = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(bool(checked), id).run();
  return true;
}

export async function createPantryItem(input: Partial<PantryItem>) {
  const database = db();
  const item: PantryItem = { id: input.id ?? createId("pantry"), name: input.name?.trim() || "Pantry item", quantity: Number(input.quantity ?? 1), unit: input.unit ?? "", category: input.category ?? "Other", purchaseDate: input.purchaseDate ?? "", expirationDate: input.expirationDate ?? "", lowStock: input.lowStock ?? false, staple: input.staple ?? false, notes: input.notes ?? "" };
  if (!database) return item;
  await database.prepare("INSERT OR REPLACE INTO health_pantry_items (id, name, quantity, unit, category, purchase_date, expiration_date, low_stock, staple, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(item.id, item.name, item.quantity, item.unit, item.category, item.purchaseDate, item.expirationDate, bool(item.lowStock), bool(item.staple), item.notes).run();
  return item;
}

export async function createProgressEntry(input: Partial<ProgressEntry>) {
  const database = db();
  const entry: ProgressEntry = { ...seedProgress[0], ...input, id: input.id ?? createId("progress"), date: input.date ?? new Date().toISOString().slice(0, 10), weight: Number(input.weight ?? seedProgress[0].weight) };
  if (!database) return entry;
  await database.prepare("INSERT OR REPLACE INTO health_progress_entries (id, date, weight, waist, chest, arms, hips, thighs, body_fat, resting_heart_rate, steps, sleep_hours, water_oz, mood, energy, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(entry.id, entry.date, entry.weight, entry.waist, entry.chest, entry.arms, entry.hips, entry.thighs, entry.bodyFat, entry.restingHeartRate, entry.steps, entry.sleepHours, entry.waterOz, entry.mood, entry.energy, entry.notes).run();
  await database.prepare("UPDATE health_profiles SET current_weight = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(entry.weight, defaultHealthProfile.id).run();
  return entry;
}

export async function upsertReminder(input: Partial<HealthReminder>) {
  const database = db();
  const reminder: HealthReminder = { id: input.id ?? createId("reminder"), type: input.type?.trim() || "Reminder", enabled: input.enabled ?? true, cadence: input.cadence ?? "Daily", time: input.time ?? "08:00" };
  if (!database) return reminder;
  await database.prepare("INSERT OR REPLACE INTO health_reminders (id, type, enabled, cadence, time) VALUES (?, ?, ?, ?, ?)").bind(reminder.id, reminder.type, bool(reminder.enabled), reminder.cadence, reminder.time).run();
  return reminder;
}

export async function saveProgressPhoto(file: File, input: Partial<ProgressPhoto>) {
  const database = db();
  const bucket = getR2Bucket("DASHBOARD_BUCKET", "DOCUMENTS_BUCKET");
  const id = createId("progress-photo");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `health/progress-photos/${id}/${safeName}`;

  await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || "application/octet-stream" } });

  if (database) {
    await database.prepare("INSERT INTO health_progress_photos (id, date, angle, weight, notes, r2_key) VALUES (?, ?, ?, ?, ?, ?)").bind(id, input.date ?? new Date().toISOString().slice(0, 10), input.angle ?? "Front", input.weight ?? null, input.notes ?? "", key).run();
  }

  return { id, date: input.date ?? new Date().toISOString().slice(0, 10), angle: input.angle ?? "Front", weight: input.weight ?? 0, notes: input.notes ?? "", url: `/api/health/photos/${id}` } satisfies ProgressPhoto;
}

export async function getProgressPhoto(id: string) {
  const database = db();
  if (!database) return null;

  const row = await database.prepare("SELECT r2_key FROM health_progress_photos WHERE id = ?").bind(id).first<{ r2_key: string }>();
  if (!row) return null;
  const object = await getR2Bucket("DASHBOARD_BUCKET", "DOCUMENTS_BUCKET").get(row.r2_key);
  return object;
}

export function suggestMeals(data: HealthData, request = "") {
  const text = request.toLowerCase();
  return data.recipes
    .filter((recipe) => !recipe.archived)
    .filter((recipe) => !text.includes("dinner") || recipe.mealType === "Dinner")
    .filter((recipe) => !text.includes("lunch") || recipe.mealType === "Lunch")
    .filter((recipe) => !text.includes("breakfast") || recipe.mealType === "Breakfast")
    .filter((recipe) => !text.includes("high-protein") || recipe.protein >= 35)
    .filter((recipe) => !text.includes("under 700") || recipe.calories <= 700)
    .slice(0, 6);
}
