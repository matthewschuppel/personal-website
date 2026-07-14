export type HealthTab = "Overview" | "Today" | "Workouts" | "Meal Planner" | "Recipes" | "Grocery List" | "Progress" | "Settings";

export type NutritionTargets = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sodium: number;
  waterOz: number;
};

export type HealthProfile = {
  id: string;
  weddingDate: string;
  startingDate: string;
  startingWeight: number;
  currentWeight: number;
  goalWeight: number;
  waistGoal: number;
  workoutGoalPerWeek: number;
  customGoalTitle: string;
  units: "imperial" | "metric";
  nutritionTargets: NutritionTargets;
};

export type Exercise = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  exerciseType: string;
  movementPattern: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  trackingType: "Reps" | "Weight + reps" | "Duration" | "Distance";
  favorite: boolean;
  custom: boolean;
  archived: boolean;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  description: string;
  goal: string;
  level: string;
  daysPerWeek: number;
  durationMinutes: number;
  equipment: string;
  structure: string;
  active: boolean;
  archived: boolean;
  scheduledDays: string[];
  notes: string;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  name: string;
  order: number;
  target: string;
  restSeconds: number;
};

export type WorkoutSession = {
  id: string;
  planId: string;
  planName: string;
  workoutName: string;
  status: "planned" | "active" | "paused" | "completed" | "cancelled" | "skipped";
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  notes: string;
  perceivedDifficulty: number;
  energy: number;
  exercises: WorkoutExercise[];
};

export type RecipeIngredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  section: string;
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  cuisine: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  servingSize: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sodium: number;
  tags: string[];
  allergens: string[];
  favorite: boolean;
  rating: number;
  aiGenerated: boolean;
  nutritionVerified: boolean;
  archived: boolean;
};

export type MealPlanEntry = {
  id: string;
  date: string;
  slot: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  recipeId: string;
  recipeName: string;
  servings: number;
  eaten: boolean;
  locked: boolean;
};

export type DailyLog = {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sodium: number;
  waterOz: number;
  steps: number;
  weight: number;
  notes: string;
};

export type GroceryItem = {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit: string;
  section: string;
  checked: boolean;
  alreadyHave: boolean;
  addToPantry: boolean;
  notes: string;
};

export type GroceryList = {
  id: string;
  name: string;
  status: "active" | "archived";
  items: GroceryItem[];
};

export type PantryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  purchaseDate: string;
  expirationDate: string;
  lowStock: boolean;
  staple: boolean;
  notes: string;
};

export type ProgressEntry = {
  id: string;
  date: string;
  weight: number;
  waist: number;
  chest: number;
  arms: number;
  hips: number;
  thighs: number;
  bodyFat: number;
  restingHeartRate: number;
  steps: number;
  sleepHours: number;
  waterOz: number;
  mood: string;
  energy: number;
  notes: string;
};

export type ProgressPhoto = {
  id: string;
  date: string;
  angle: "Front" | "Side" | "Back" | "Custom";
  weight: number;
  notes: string;
  url: string;
};

export type HealthReminder = {
  id: string;
  type: string;
  enabled: boolean;
  cadence: string;
  time: string;
};

export type HealthData = {
  profile: HealthProfile;
  exercises: Exercise[];
  workoutPlans: WorkoutPlan[];
  workoutSessions: WorkoutSession[];
  recipes: Recipe[];
  mealPlan: MealPlanEntry[];
  dailyLogs: DailyLog[];
  groceryLists: GroceryList[];
  pantry: PantryItem[];
  progress: ProgressEntry[];
  progressPhotos: ProgressPhoto[];
  reminders: HealthReminder[];
};

export const defaultHealthProfile: HealthProfile = {
  id: "health-profile",
  weddingDate: "2027-05-16",
  startingDate: "2026-07-01",
  startingWeight: 190,
  currentWeight: 186,
  goalWeight: 178,
  waistGoal: 32,
  workoutGoalPerWeek: 4,
  customGoalTitle: "Wedding strength and energy",
  units: "imperial",
  nutritionTargets: {
    calories: 2300,
    protein: 180,
    carbohydrates: 220,
    fat: 70,
    fiber: 32,
    sodium: 2300,
    waterOz: 110
  }
};

export const seedExercises: Exercise[] = [
  { id: "ex-bench", name: "Bench Press", description: "Horizontal barbell press for upper-body strength.", instructions: "Set shoulders, lower under control, press evenly.", primaryMuscle: "Chest", secondaryMuscles: ["Triceps", "Shoulders"], equipment: "Barbell", exerciseType: "Strength", movementPattern: "Push", difficulty: "Intermediate", trackingType: "Weight + reps", favorite: true, custom: false, archived: false },
  { id: "ex-squat", name: "Back Squat", description: "Lower-body compound lift for legs and trunk control.", instructions: "Brace, sit between hips, keep pressure through midfoot.", primaryMuscle: "Quads", secondaryMuscles: ["Glutes", "Core"], equipment: "Barbell", exerciseType: "Strength", movementPattern: "Squat", difficulty: "Intermediate", trackingType: "Weight + reps", favorite: true, custom: false, archived: false },
  { id: "ex-row", name: "One-arm Dumbbell Row", description: "Single-arm pulling movement for lats and upper back.", instructions: "Support torso, pull elbow toward hip, pause briefly.", primaryMuscle: "Back", secondaryMuscles: ["Biceps"], equipment: "Dumbbell", exerciseType: "Strength", movementPattern: "Pull", difficulty: "Beginner", trackingType: "Weight + reps", favorite: false, custom: false, archived: false },
  { id: "ex-rdl", name: "Romanian Deadlift", description: "Hip-hinge lift emphasizing hamstrings and glutes.", instructions: "Push hips back, keep lats tight, stand tall without overextending.", primaryMuscle: "Hamstrings", secondaryMuscles: ["Glutes", "Back"], equipment: "Barbell", exerciseType: "Strength", movementPattern: "Hinge", difficulty: "Intermediate", trackingType: "Weight + reps", favorite: false, custom: false, archived: false },
  { id: "ex-plank", name: "Front Plank", description: "Core bracing hold.", instructions: "Stack ribs over pelvis and breathe slowly.", primaryMuscle: "Core", secondaryMuscles: ["Shoulders"], equipment: "Bodyweight", exerciseType: "Core", movementPattern: "Core", difficulty: "Beginner", trackingType: "Duration", favorite: false, custom: false, archived: false },
  { id: "ex-walk", name: "Incline Walk", description: "Low-impact conditioning.", instructions: "Choose a steady pace and breathe through the nose when possible.", primaryMuscle: "Cardio", secondaryMuscles: ["Calves"], equipment: "Cardio machine", exerciseType: "Cardio", movementPattern: "Cardio", difficulty: "Beginner", trackingType: "Duration", favorite: false, custom: false, archived: false }
];

export const seedWorkoutPlans: WorkoutPlan[] = [
  { id: "plan-full-body", name: "Three-day Full Body", description: "Balanced strength and conditioning plan.", goal: "Wedding preparation", level: "Intermediate", daysPerWeek: 3, durationMinutes: 55, equipment: "Barbell, dumbbell, cable", structure: "Full body", active: true, archived: false, scheduledDays: ["Monday", "Wednesday", "Friday"], notes: "Progress lifts slowly and keep one conditioning finisher." },
  { id: "plan-travel", name: "Hotel Travel Plan", description: "Short sessions for busy travel weeks.", goal: "Consistency", level: "Beginner", daysPerWeek: 3, durationMinutes: 28, equipment: "Dumbbell, bodyweight", structure: "Travel workout", active: false, archived: false, scheduledDays: ["Tuesday", "Thursday", "Saturday"], notes: "Minimal setup, no missed momentum." }
];

export const seedWorkoutSessions: WorkoutSession[] = [
  {
    id: "session-today",
    planId: "plan-full-body",
    planName: "Three-day Full Body",
    workoutName: "Full Body A",
    status: "planned",
    startedAt: "",
    completedAt: "",
    durationMinutes: 55,
    notes: "",
    perceivedDifficulty: 0,
    energy: 0,
    exercises: [
      { id: "wx-1", exerciseId: "ex-squat", name: "Back Squat", order: 1, target: "3 x 5 at RPE 7", restSeconds: 150 },
      { id: "wx-2", exerciseId: "ex-bench", name: "Bench Press", order: 2, target: "3 x 8", restSeconds: 120 },
      { id: "wx-3", exerciseId: "ex-row", name: "One-arm Dumbbell Row", order: 3, target: "3 x 10 each", restSeconds: 75 }
    ]
  }
];

export const seedRecipes: Recipe[] = [
  { id: "recipe-oats", name: "Greek Yogurt Overnight Oats", description: "High-protein breakfast with berries and oats.", mealType: "Breakfast", cuisine: "American", ingredients: [{ id: "ing-oats", name: "rolled oats", quantity: 0.5, unit: "cup", section: "Pantry" }, { id: "ing-yogurt", name: "Greek yogurt", quantity: 1, unit: "cup", section: "Dairy and eggs" }, { id: "ing-berries", name: "berries", quantity: 0.5, unit: "cup", section: "Produce" }], instructions: ["Stir oats and yogurt together.", "Top with berries.", "Chill overnight."], prepMinutes: 8, cookMinutes: 0, servings: 1, servingSize: "1 bowl", calories: 430, protein: 38, carbohydrates: 48, fat: 8, fiber: 9, sodium: 120, tags: ["High protein", "Meal prep"], allergens: ["Dairy"], favorite: true, rating: 5, aiGenerated: false, nutritionVerified: false, archived: false },
  { id: "recipe-chicken-bowl", name: "Chicken Rice Meal-prep Bowls", description: "Lean protein, rice, vegetables, and simple sauce.", mealType: "Lunch", cuisine: "Meal prep", ingredients: [{ id: "ing-chicken", name: "chicken breast", quantity: 1.5, unit: "lb", section: "Meat and seafood" }, { id: "ing-rice", name: "rice", quantity: 2, unit: "cup", section: "Pantry" }, { id: "ing-broccoli", name: "broccoli", quantity: 4, unit: "cup", section: "Produce" }], instructions: ["Cook rice.", "Season and cook chicken.", "Steam vegetables and portion bowls."], prepMinutes: 15, cookMinutes: 25, servings: 4, servingSize: "1 bowl", calories: 590, protein: 48, carbohydrates: 62, fat: 14, fiber: 7, sodium: 520, tags: ["High protein", "Budget friendly"], allergens: [], favorite: true, rating: 5, aiGenerated: false, nutritionVerified: false, archived: false },
  { id: "recipe-salmon", name: "Salmon with Roasted Vegetables", description: "Simple dinner with omega-rich salmon and vegetables.", mealType: "Dinner", cuisine: "Mediterranean", ingredients: [{ id: "ing-salmon", name: "salmon fillets", quantity: 2, unit: "fillet", section: "Meat and seafood" }, { id: "ing-zucchini", name: "zucchini", quantity: 2, unit: "each", section: "Produce" }, { id: "ing-potato", name: "baby potatoes", quantity: 1, unit: "lb", section: "Produce" }], instructions: ["Roast vegetables until tender.", "Bake salmon with lemon and herbs.", "Serve together."], prepMinutes: 10, cookMinutes: 22, servings: 2, servingSize: "1 plate", calories: 640, protein: 45, carbohydrates: 44, fat: 30, fiber: 8, sodium: 410, tags: ["Mediterranean", "High protein"], allergens: ["Fish"], favorite: false, rating: 4, aiGenerated: false, nutritionVerified: false, archived: false }
];

const today = new Date().toISOString().slice(0, 10);

export const seedMealPlan: MealPlanEntry[] = [
  { id: "meal-1", date: today, slot: "Breakfast", recipeId: "recipe-oats", recipeName: "Greek Yogurt Overnight Oats", servings: 1, eaten: false, locked: true },
  { id: "meal-2", date: today, slot: "Lunch", recipeId: "recipe-chicken-bowl", recipeName: "Chicken Rice Meal-prep Bowls", servings: 1, eaten: false, locked: false },
  { id: "meal-3", date: today, slot: "Dinner", recipeId: "recipe-salmon", recipeName: "Salmon with Roasted Vegetables", servings: 1, eaten: false, locked: false }
];

export const seedDailyLogs: DailyLog[] = [
  { id: "log-today", date: today, calories: 1020, protein: 86, carbohydrates: 110, fat: 28, fiber: 15, sodium: 920, waterOz: 48, steps: 6200, weight: 186, notes: "Solid start. Prioritize water and dinner protein." }
];

export const seedGroceryLists: GroceryList[] = [
  { id: "grocery-weekly", name: "Weekly groceries", status: "active", items: [] }
];

export const seedPantry: PantryItem[] = [
  { id: "pantry-rice", name: "rice", quantity: 3, unit: "cup", category: "Pantry", purchaseDate: "", expirationDate: "2026-12-01", lowStock: false, staple: true, notes: "Good for bowls." },
  { id: "pantry-oats", name: "rolled oats", quantity: 2, unit: "lb", category: "Pantry", purchaseDate: "", expirationDate: "2026-11-15", lowStock: false, staple: true, notes: "" }
];

export const seedProgress: ProgressEntry[] = [
  { id: "progress-1", date: today, weight: 186, waist: 34, chest: 40, arms: 14, hips: 38, thighs: 22, bodyFat: 0, restingHeartRate: 62, steps: 6200, sleepHours: 7.1, waterOz: 48, mood: "Focused", energy: 7, notes: "Baseline wedding prep check-in." }
];

export const seedProgressPhotos: ProgressPhoto[] = [];

export const seedReminders: HealthReminder[] = [
  { id: "rem-workout", type: "Workout reminder", enabled: true, cadence: "Training days", time: "07:00" },
  { id: "rem-water", type: "Water reminder", enabled: true, cadence: "Daily", time: "10:00" },
  { id: "rem-photo", type: "Progress photo reminder", enabled: true, cadence: "Monthly", time: "09:00" }
];

export const seedHealthData: HealthData = {
  profile: defaultHealthProfile,
  exercises: seedExercises,
  workoutPlans: seedWorkoutPlans,
  workoutSessions: seedWorkoutSessions,
  recipes: seedRecipes,
  mealPlan: seedMealPlan,
  dailyLogs: seedDailyLogs,
  groceryLists: seedGroceryLists,
  pantry: seedPantry,
  progress: seedProgress,
  progressPhotos: seedProgressPhotos,
  reminders: seedReminders
};
