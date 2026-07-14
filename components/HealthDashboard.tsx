"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Apple, Camera, Droplets, Dumbbell, HeartPulse, Scale, ShoppingCart, Sparkles, Utensils } from "lucide-react";
import { seedHealthData, type GroceryItem, type HealthData, type HealthTab, type MealPlanEntry, type Recipe, type WorkoutSession } from "@/data/health";
import { adherence, calculateRecipeNutrition, daysUntil, epleyOneRepMax, rollingAverage } from "@/lib/health-calculations";

const tabs: HealthTab[] = ["Overview", "Today", "Workouts", "Meal Planner", "Recipes", "Grocery List", "Progress", "Settings"];

function Card({ title, eyebrow, action, children }: { title: string; eyebrow?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white/82 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">{eyebrow}</p> : null}
          <h2 className="mt-1 text-lg font-semibold text-ink">{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Metric({ label, value, icon, sub }: { label: string; value: string; icon: ReactNode; sub?: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-mist/55 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{label}</p>
        <span className="text-ink/45">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {sub ? <p className="mt-1 text-xs text-ink/50">{sub}</p> : null}
    </div>
  );
}

function ProgressBar({ label, value, target, unit = "" }: { label: string; value: number; target: number; unit?: string }) {
  const pct = adherence(value, target);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-ink/55">{value}{unit} / {target}{unit}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
        <div className="h-full rounded-full bg-moss" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function currentWeekDates() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

function mealTotals(meals: MealPlanEntry[], recipes: Recipe[]) {
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  return meals.reduce(
    (totals, meal) => {
      const recipe = recipeMap.get(meal.recipeId);
      if (!recipe) return totals;
      const nutrition = calculateRecipeNutrition(recipe, recipe.servings * meal.servings);
      return {
        calories: totals.calories + nutrition.calories,
        protein: totals.protein + nutrition.protein,
        carbohydrates: totals.carbohydrates + nutrition.carbohydrates,
        fat: totals.fat + nutrition.fat,
        fiber: totals.fiber + nutrition.fiber,
        sodium: totals.sodium + nutrition.sodium
      };
    },
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sodium: 0 }
  );
}

export function HealthDashboard() {
  const [data, setData] = useState<HealthData>(seedHealthData);
  const [activeTab, setActiveTab] = useState<HealthTab>("Overview");
  const [activity, setActivity] = useState("Ready.");
  const [suggestionRequest, setSuggestionRequest] = useState("");
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function loadHealth() {
    try {
      const response = await fetch("/api/health");
      const body = await response.json() as { health?: HealthData };
      setData(body.health ?? seedHealthData);
      setActivity("Health data synced.");
    } catch {
      setActivity("Using seed health data because the API is unavailable.");
    }
  }

  useEffect(() => {
    void loadHealth();
  }, []);

  const today = todayKey();
  const todayLog = data.dailyLogs.find((log) => log.date === today) ?? data.dailyLogs[0];
  const todayMeals = data.mealPlan.filter((meal) => meal.date === today);
  const todayNutrition = mealTotals(todayMeals, data.recipes);
  const todayWorkout = data.workoutSessions.find((session) => session.status === "active") ?? data.workoutSessions.find((session) => session.status === "planned") ?? data.workoutSessions[0];
  const completedThisWeek = data.workoutSessions.filter((session) => session.status === "completed" && currentWeekDates().includes((session.completedAt || "").slice(0, 10))).length;
  const weddingDays = daysUntil(data.profile.weddingDate);
  const weightProgress = data.profile.startingWeight === data.profile.goalWeight ? 0 : Math.round(((data.profile.startingWeight - data.profile.currentWeight) / (data.profile.startingWeight - data.profile.goalWeight)) * 100);
  const movingAverage = rollingAverage([...data.dailyLogs].reverse()).slice(-7);

  async function postJson(path: string, body: unknown) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    await loadHealth();
    return response.ok;
  }

  async function patchJson(path: string, body: unknown) {
    const response = await fetch(path, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    await loadHealth();
    return response.ok;
  }

  async function startWorkout(session: WorkoutSession) {
    await patchJson(`/api/health/workout-sessions/${session.id}`, { status: "active", startedAt: new Date().toISOString() });
    setActivity(`Started ${session.workoutName}.`);
  }

  async function completeWorkout(session: WorkoutSession) {
    await patchJson(`/api/health/workout-sessions/${session.id}`, { status: "completed", completedAt: new Date().toISOString(), durationMinutes: session.durationMinutes || 55, perceivedDifficulty: 7, energy: 7 });
    setActivity("Workout completed and saved.");
  }

  async function addRecipe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await postJson("/api/health/recipes", {
      name: form.get("name"),
      mealType: form.get("mealType"),
      calories: Number(form.get("calories") ?? 0),
      protein: Number(form.get("protein") ?? 0),
      carbohydrates: Number(form.get("carbohydrates") ?? 0),
      fat: Number(form.get("fat") ?? 0),
      fiber: Number(form.get("fiber") ?? 0),
      sodium: Number(form.get("sodium") ?? 0),
      description: "User-created recipe.",
      cuisine: "Custom",
      servings: 1,
      servingSize: "1 serving",
      ingredients: [],
      instructions: ["Add preparation steps."],
      tags: ["Custom"]
    });
    event.currentTarget.reset();
    setActivity("Recipe saved.");
  }

  async function addMeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const recipe = data.recipes.find((item) => item.id === form.get("recipeId"));
    if (!recipe) return;
    await postJson("/api/health/meal-plan", { date: form.get("date"), slot: form.get("slot"), recipeId: recipe.id, recipeName: recipe.name, servings: Number(form.get("servings") ?? 1) });
    setActivity("Meal added to plan.");
  }

  async function logDaily(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await postJson("/api/health/daily-log", {
      date: today,
      calories: Number(form.get("calories") ?? todayLog.calories),
      protein: Number(form.get("protein") ?? todayLog.protein),
      carbohydrates: Number(form.get("carbohydrates") ?? todayLog.carbohydrates),
      fat: Number(form.get("fat") ?? todayLog.fat),
      fiber: Number(form.get("fiber") ?? todayLog.fiber),
      sodium: Number(form.get("sodium") ?? todayLog.sodium),
      waterOz: Number(form.get("waterOz") ?? todayLog.waterOz),
      steps: Number(form.get("steps") ?? todayLog.steps),
      weight: Number(form.get("weight") ?? todayLog.weight),
      notes: String(form.get("notes") ?? todayLog.notes)
    });
    setActivity("Today log saved.");
  }

  async function generateSuggestions() {
    const response = await fetch("/api/health/suggestions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ request: suggestionRequest }) });
    const body = await response.json() as { suggestions?: Recipe[] };
    setSuggestions(body.suggestions ?? []);
    setActivity("Meal suggestions generated from local rules.");
  }

  async function uploadPhoto(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("date", today);
    form.append("angle", "Front");
    form.append("weight", String(todayLog.weight || data.profile.currentWeight));
    const response = await fetch("/api/health/photos", { method: "POST", body: form });
    setActivity(response.ok ? "Progress photo uploaded privately." : "Progress photo upload failed.");
    await loadHealth();
  }

  const groceryItems = data.groceryLists.flatMap((list) => list.items);
  const uncheckedGroceries = groceryItems.filter((item) => !item.checked);
  const expiringPantry = data.pantry.filter((item) => item.expirationDate && daysUntil(item.expirationDate) <= 14);

  return (
    <main className="min-h-screen bg-paper px-4 py-6 text-ink sm:px-6 lg:px-8">
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPhoto(file); event.currentTarget.value = ""; }} />
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-ink/10 bg-white/82 p-5 shadow-crisp">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Private MatthewOS Module</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">Health</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
                A calm fitness, nutrition, and wedding-prep system for consistency, strength, energy, and sustainable progress.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-md px-3 py-2 text-sm font-semibold ${activeTab === tab ? "bg-ink text-paper" : "bg-mist text-ink/65 hover:bg-white"}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm text-ink/55">{activity}</p>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Calories" value={`${todayLog.calories}/${data.profile.nutritionTargets.calories}`} icon={<Utensils size={17} />} sub={`${adherence(todayLog.calories, data.profile.nutritionTargets.calories)}% logged`} />
          <Metric label="Protein" value={`${todayLog.protein}g`} icon={<Apple size={17} />} sub={`${data.profile.nutritionTargets.protein}g target`} />
          <Metric label="Water" value={`${todayLog.waterOz} oz`} icon={<Droplets size={17} />} sub={`${data.profile.nutritionTargets.waterOz} oz target`} />
          <Metric label="Wedding" value={weddingDays >= 0 ? `${weddingDays} days` : "Complete"} icon={<HeartPulse size={17} />} sub={data.profile.customGoalTitle} />
          <Metric label="Weight" value={`${data.profile.currentWeight} lb`} icon={<Scale size={17} />} sub={`${data.profile.goalWeight} lb goal`} />
          <Metric label="Workouts" value={`${completedThisWeek}/${data.profile.workoutGoalPerWeek}`} icon={<Dumbbell size={17} />} sub="completed this week" />
          <Metric label="Groceries" value={`${uncheckedGroceries.length}`} icon={<ShoppingCart size={17} />} sub="items remaining" />
          <Metric label="Consistency" value={`${Math.round((adherence(todayLog.protein, data.profile.nutritionTargets.protein) + adherence(todayLog.waterOz, data.profile.nutritionTargets.waterOz) + adherence(completedThisWeek, data.profile.workoutGoalPerWeek)) / 3)}%`} icon={<Sparkles size={17} />} sub="today + week blend" />
        </section>

        {activeTab === "Overview" ? (
          <section className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card title="Weekly Summary" eyebrow="Overview">
              <div className="grid gap-4 md:grid-cols-2">
                <ProgressBar label="Workout completion" value={completedThisWeek} target={data.profile.workoutGoalPerWeek} />
                <ProgressBar label="Protein adherence" value={todayLog.protein} target={data.profile.nutritionTargets.protein} unit="g" />
                <ProgressBar label="Water intake" value={todayLog.waterOz} target={data.profile.nutritionTargets.waterOz} unit=" oz" />
                <ProgressBar label="Wedding weight progress" value={Math.max(0, weightProgress)} target={100} unit="%" />
              </div>
              <div className="mt-5 grid gap-2">
                {movingAverage.map((point) => <div key={point.date} className="flex items-center gap-3 text-sm"><span className="w-24 text-ink/50">{point.date.slice(5)}</span><div className="h-2 flex-1 rounded-full bg-mist"><div className="h-full rounded-full bg-moss" style={{ width: `${Math.min(100, point.value / Math.max(data.profile.startingWeight, 1) * 100)}%` }} /></div><span>{point.value} lb avg</span></div>)}
              </div>
            </Card>
            <Card title="Quick Actions" eyebrow="Daily use">
              <div className="grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => void startWorkout(todayWorkout)} className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper">Start workout</button>
                <button type="button" onClick={() => setActiveTab("Meal Planner")} className="rounded-md border border-ink/10 bg-mist px-4 py-3 text-sm font-semibold text-ink/70">Plan meals</button>
                <button type="button" onClick={() => setActiveTab("Grocery List")} className="rounded-md border border-ink/10 bg-mist px-4 py-3 text-sm font-semibold text-ink/70">View grocery list</button>
                <button type="button" onClick={() => photoInputRef.current?.click()} className="rounded-md border border-ink/10 bg-mist px-4 py-3 text-sm font-semibold text-ink/70">Add progress photo</button>
              </div>
              <p className="mt-4 text-sm leading-6 text-ink/60">Nutrition targets are planning estimates, not medical advice. Keep changes sustainable and adjust with a qualified professional when needed.</p>
            </Card>
          </section>
        ) : null}

        {activeTab === "Today" ? (
          <section className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <Card title="Today's Workout" eyebrow={today}>
              <p className="font-semibold">{todayWorkout.planName} / {todayWorkout.workoutName}</p>
              <p className="mt-1 text-sm text-ink/55">{todayWorkout.durationMinutes} min / {todayWorkout.exercises.length} exercises / {todayWorkout.status}</p>
              <div className="mt-4 space-y-2">{todayWorkout.exercises.map((exercise) => <div key={exercise.id} className="rounded-md bg-mist/70 px-3 py-2 text-sm"><span className="font-semibold">{exercise.name}</span><span className="ml-2 text-ink/55">Target: {exercise.target} / Rest {exercise.restSeconds}s</span></div>)}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => void startWorkout(todayWorkout)} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper">Start</button>
                <button type="button" onClick={() => void completeWorkout(todayWorkout)} className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink/65">Complete</button>
                <button type="button" onClick={() => void patchJson(`/api/health/workout-sessions/${todayWorkout.id}`, { status: "skipped" })} className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink/65">Skip</button>
              </div>
            </Card>
            <Card title="Daily Nutrition Tracker" eyebrow="Today">
              <form onSubmit={logDaily} className="grid gap-3">
                <ProgressBar label="Calories" value={todayLog.calories} target={data.profile.nutritionTargets.calories} />
                <ProgressBar label="Protein" value={todayLog.protein} target={data.profile.nutritionTargets.protein} unit="g" />
                <ProgressBar label="Carbs" value={todayLog.carbohydrates} target={data.profile.nutritionTargets.carbohydrates} unit="g" />
                <ProgressBar label="Fat" value={todayLog.fat} target={data.profile.nutritionTargets.fat} unit="g" />
                <ProgressBar label="Fiber" value={todayLog.fiber} target={data.profile.nutritionTargets.fiber} unit="g" />
                <ProgressBar label="Water" value={todayLog.waterOz} target={data.profile.nutritionTargets.waterOz} unit=" oz" />
                <div className="grid gap-2 sm:grid-cols-3">
                  <input name="calories" defaultValue={todayLog.calories} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                  <input name="protein" defaultValue={todayLog.protein} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                  <input name="waterOz" defaultValue={todayLog.waterOz} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                  <input name="steps" defaultValue={todayLog.steps} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                  <input name="weight" defaultValue={todayLog.weight} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                  <input name="notes" defaultValue={todayLog.notes} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                </div>
                <input type="hidden" name="carbohydrates" value={todayLog.carbohydrates} />
                <input type="hidden" name="fat" value={todayLog.fat} />
                <input type="hidden" name="fiber" value={todayLog.fiber} />
                <input type="hidden" name="sodium" value={todayLog.sodium} />
                <button type="submit" className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper">Save Daily Log</button>
              </form>
            </Card>
            <Card title="Today's Meals" eyebrow="Meal plan">
              <p className="mb-3 text-sm text-ink/55">
                Planned total: {todayNutrition.calories} cal / {todayNutrition.protein}g protein / {todayNutrition.carbohydrates}g carbs / {todayNutrition.fat}g fat.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {todayMeals.map((meal) => <div key={meal.id} className="rounded-lg bg-mist/60 p-3"><p className="font-semibold">{meal.slot}: {meal.recipeName}</p><p className="text-sm text-ink/55">{meal.servings} serving / {meal.eaten ? "eaten" : "planned"}</p></div>)}
              </div>
            </Card>
            <Card title="Upcoming Reminders" eyebrow="Automation-ready">
              <div className="space-y-2">{data.reminders.map((reminder) => <div key={reminder.id} className="flex items-center justify-between rounded-md bg-mist/60 px-3 py-2 text-sm"><span>{reminder.type}</span><span>{reminder.enabled ? `${reminder.cadence} at ${reminder.time}` : "off"}</span></div>)}</div>
            </Card>
          </section>
        ) : null}

        {activeTab === "Workouts" ? (
          <section className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Card title="Workout Plan Builder" eyebrow="Plans">
              <form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void postJson("/api/health/workout-plans", { name: form.get("name"), goal: form.get("goal"), structure: form.get("structure"), daysPerWeek: Number(form.get("daysPerWeek") ?? 3), durationMinutes: Number(form.get("durationMinutes") ?? 45), equipment: form.get("equipment"), level: form.get("level"), description: "Created from Health plan builder.", scheduledDays: ["Monday", "Wednesday", "Friday"], active: true }); event.currentTarget.reset(); }} className="grid gap-2">
                <input name="name" placeholder="Plan name" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <select name="goal" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"><option>Wedding preparation</option><option>Strength</option><option>Muscle gain</option><option>Fat loss</option><option>Mobility</option><option>Custom</option></select>
                <select name="structure" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"><option>Full body</option><option>Upper/lower</option><option>Push/pull/legs</option><option>Home workout</option><option>Travel workout</option></select>
                <input name="daysPerWeek" placeholder="Days/week" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="durationMinutes" placeholder="Minutes/session" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="equipment" placeholder="Equipment" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="level" placeholder="Experience level" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <button type="submit" className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper">Create Active Plan</button>
              </form>
            </Card>
            <Card title="Plans, Library, and History" eyebrow="Training">
              <div className="grid gap-3">
                {data.workoutPlans.map((plan) => <div key={plan.id} className="rounded-lg bg-mist/60 p-3"><p className="font-semibold">{plan.name}</p><p className="text-sm text-ink/55">{plan.goal} / {plan.structure} / {plan.daysPerWeek} days / {plan.active ? "active" : "inactive"}</p></div>)}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div><p className="font-semibold">Exercise Library</p><div className="mt-2 space-y-2">{data.exercises.slice(0, 8).map((exercise) => <p key={exercise.id} className="rounded-md bg-white px-3 py-2 text-sm">{exercise.name} / {exercise.primaryMuscle} / {exercise.equipment}</p>)}</div></div>
                <div><p className="font-semibold">History + Analytics</p><div className="mt-2 space-y-2">{data.workoutSessions.map((session) => <p key={session.id} className="rounded-md bg-white px-3 py-2 text-sm">{session.workoutName} / {session.status} / Est. 1RM sample {epleyOneRepMax(165, 8)} lb</p>)}</div></div>
              </div>
            </Card>
          </section>
        ) : null}

        {activeTab === "Meal Planner" ? (
          <section className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Card title="Weekly Meal Planner" eyebrow="Recipes + nutrition">
              <form onSubmit={addMeal} className="grid gap-2 md:grid-cols-2">
                <input name="date" type="date" defaultValue={today} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <select name="slot" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select>
                <select name="recipeId" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm">{data.recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.name}</option>)}</select>
                <input name="servings" defaultValue="1" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <button type="submit" className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper md:col-span-2">Add Meal</button>
              </form>
              <div className="mt-4 grid gap-2">{data.mealPlan.slice(0, 12).map((meal) => <div key={meal.id} className="rounded-md bg-mist/60 px-3 py-2 text-sm">{meal.date} / {meal.slot} / {meal.recipeName} / {meal.servings} serving</div>)}</div>
            </Card>
            <Card title="Healthy Meal Suggestions" eyebrow="Rule-based, AI-ready">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input value={suggestionRequest} onChange={(event) => setSuggestionRequest(event.target.value)} placeholder="Try: five high-protein dinners under 700 calories" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <button type="button" onClick={() => void generateSuggestions()} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper">Suggest</button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">{(suggestions.length ? suggestions : data.recipes).slice(0, 6).map((recipe) => <div key={recipe.id} className="rounded-lg bg-mist/60 p-3"><p className="font-semibold">{recipe.name}</p><p className="text-sm text-ink/55">{recipe.calories} cal / {recipe.protein}g protein / {recipe.tags.join(", ")}</p></div>)}</div>
            </Card>
          </section>
        ) : null}

        {activeTab === "Recipes" ? (
          <section className="mt-5 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <Card title="Create Recipe" eyebrow="Library">
              <form onSubmit={addRecipe} className="grid gap-2">
                <input name="name" placeholder="Recipe name" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <select name="mealType" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select>
                <input name="calories" placeholder="Calories" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="protein" placeholder="Protein" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="carbohydrates" placeholder="Carbs" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="fat" placeholder="Fat" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="fiber" placeholder="Fiber" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="sodium" placeholder="Sodium" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <button type="submit" className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper">Save Recipe</button>
              </form>
            </Card>
            <Card title="Recipe Library" eyebrow="Scale, favorite, plan">
              <div className="grid gap-3 md:grid-cols-2">{data.recipes.map((recipe) => <div key={recipe.id} className="rounded-lg bg-mist/60 p-3"><p className="font-semibold">{recipe.name}</p><p className="text-sm text-ink/55">{recipe.mealType} / {recipe.calories} cal / {recipe.protein}g protein / {recipe.servings} servings</p><p className="mt-2 text-xs text-ink/45">{recipe.aiGenerated ? "AI generated, nutrition estimate" : recipe.nutritionVerified ? "Nutrition verified" : "Nutrition estimate"}</p></div>)}</div>
            </Card>
          </section>
        ) : null}

        {activeTab === "Grocery List" ? (
          <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr]">
            <Card title="Grocery Shopping Mode" eyebrow="Generated from meals">
              <button type="button" onClick={() => void postJson("/api/health/grocery/generate", {})} className="mb-4 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper">Generate from meal plan</button>
              <div className="sticky top-2 z-10 mb-3 rounded-md bg-paper px-3 py-2 text-sm font-semibold text-ink shadow-sm">{groceryItems.filter((item) => item.checked).length}/{groceryItems.length} checked</div>
              <div className="space-y-2">{groceryItems.map((item: GroceryItem) => <button key={item.id} type="button" onClick={() => { void patchJson(`/api/health/grocery/items/${item.id}`, { checked: !item.checked }); }} className={`flex w-full items-center justify-between rounded-md px-4 py-3 text-left text-sm ${item.checked ? "bg-mist/40 text-ink/35 line-through" : "bg-mist text-ink"}`}><span>{item.name} / {item.quantity} {item.unit}</span><span>{item.section}</span></button>)}</div>
            </Card>
            <Card title="Pantry" eyebrow="Low stock + expiring soon">
              <form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void postJson("/api/health/pantry", { name: form.get("name"), quantity: Number(form.get("quantity") ?? 1), unit: form.get("unit"), category: form.get("category"), expirationDate: form.get("expirationDate"), staple: form.get("staple") === "on" }); event.currentTarget.reset(); }} className="mb-4 grid gap-2 sm:grid-cols-2">
                <input name="name" placeholder="Pantry item" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="quantity" placeholder="Qty" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="unit" placeholder="Unit" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="category" placeholder="Category" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="expirationDate" type="date" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <label className="flex items-center gap-2 text-sm"><input name="staple" type="checkbox" /> Staple</label>
                <button type="submit" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper sm:col-span-2">Add Pantry Item</button>
              </form>
              <div className="space-y-2">{data.pantry.map((item) => <div key={item.id} className="rounded-md bg-mist/60 px-3 py-2 text-sm">{item.name} / {item.quantity} {item.unit} / {item.expirationDate || "no date"} {expiringPantry.some((exp) => exp.id === item.id) ? " / expiring soon" : ""}</div>)}</div>
            </Card>
          </section>
        ) : null}

        {activeTab === "Progress" ? (
          <section className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Card title="Progress Tracking" eyebrow="Trends">
              <form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void postJson("/api/health/progress", { date: form.get("date"), weight: Number(form.get("weight")), waist: Number(form.get("waist") ?? 0), steps: Number(form.get("steps") ?? 0), sleepHours: Number(form.get("sleepHours") ?? 0), waterOz: Number(form.get("waterOz") ?? 0), mood: form.get("mood"), energy: Number(form.get("energy") ?? 0), notes: form.get("notes") }); event.currentTarget.reset(); }} className="grid gap-2">
                <input name="date" type="date" defaultValue={today} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="weight" placeholder="Weight" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="waist" placeholder="Waist" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="steps" placeholder="Steps" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="sleepHours" placeholder="Sleep hours" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="waterOz" placeholder="Water oz" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="mood" placeholder="Mood" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="energy" placeholder="Energy 1-10" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="notes" placeholder="Notes" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <button type="submit" className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper">Log Progress</button>
              </form>
              <button type="button" onClick={() => photoInputRef.current?.click()} className="mt-3 inline-flex items-center gap-2 rounded-md border border-ink/10 px-4 py-3 text-sm font-semibold text-ink/65"><Camera size={16} /> Upload private progress photo</button>
            </Card>
            <Card title="Progress Dashboard" eyebrow="7-day average + photos">
              <div className="space-y-3">{movingAverage.map((point) => <ProgressBar key={point.date} label={point.date} value={point.value} target={Math.max(data.profile.startingWeight, point.value)} unit=" lb" />)}</div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">{data.progressPhotos.map((photo) => <div key={photo.id} className="rounded-lg bg-mist/60 p-3"><p className="font-semibold">{photo.angle} / {photo.date}</p><p className="text-sm text-ink/55">{photo.weight} lb / {photo.notes}</p></div>)}</div>
            </Card>
          </section>
        ) : null}

        {activeTab === "Settings" ? (
          <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr]">
            <Card title="Wedding Goal Tracking" eyebrow="Supportive targets">
              <p className="text-sm leading-6 text-ink/60">Wedding date: {data.profile.weddingDate}. Goal progress: {Math.max(0, weightProgress)}%. Focus is consistency, strength, energy, healthy routines, and sustainable progress.</p>
              <div className="mt-4 grid gap-3"><ProgressBar label="Weight goal progress" value={Math.max(0, weightProgress)} target={100} unit="%" /><ProgressBar label="Workout consistency" value={completedThisWeek} target={data.profile.workoutGoalPerWeek} /></div>
            </Card>
            <Card title="Reminders + Automations" eyebrow="Stored preferences">
              <div className="space-y-2">{data.reminders.map((reminder) => <div key={reminder.id} className="flex items-center justify-between rounded-md bg-mist/60 px-3 py-2 text-sm"><span>{reminder.type}</span><span>{reminder.enabled ? `${reminder.cadence} / ${reminder.time}` : "off"}</span></div>)}</div>
              <p className="mt-4 text-sm leading-6 text-ink/55">Reminder preferences are stored. Actual push/email scheduling requires a future scheduler or notification provider.</p>
            </Card>
          </section>
        ) : null}
      </div>
    </main>
  );
}
