import type { DailyLog, GroceryItem, MealPlanEntry, Recipe, RecipeIngredient } from "@/data/health";

export function calculateRecipeNutrition(recipe: Recipe, servings = 1) {
  const multiplier = servings / Math.max(recipe.servings, 1);

  return {
    calories: Math.round(recipe.calories * multiplier),
    protein: Math.round(recipe.protein * multiplier),
    carbohydrates: Math.round(recipe.carbohydrates * multiplier),
    fat: Math.round(recipe.fat * multiplier),
    fiber: Math.round(recipe.fiber * multiplier),
    sodium: Math.round(recipe.sodium * multiplier)
  };
}

export function scaleIngredients(recipe: Recipe, servings = recipe.servings): RecipeIngredient[] {
  const multiplier = servings / Math.max(recipe.servings, 1);
  return recipe.ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: Number((ingredient.quantity * multiplier).toFixed(2))
  }));
}

export function consolidateGroceryItems(items: Array<Omit<GroceryItem, "id" | "listId" | "checked" | "alreadyHave" | "addToPantry" | "notes">>) {
  const grouped = new Map<string, Omit<GroceryItem, "id" | "listId" | "checked" | "alreadyHave" | "addToPantry" | "notes">>();

  for (const item of items) {
    const key = `${item.name.toLowerCase()}::${item.unit.toLowerCase()}::${item.section.toLowerCase()}`;
    const existing = grouped.get(key);
    grouped.set(key, existing ? { ...existing, quantity: Number((existing.quantity + item.quantity).toFixed(2)) } : item);
  }

  return Array.from(grouped.values()).sort((a, b) => a.section.localeCompare(b.section) || a.name.localeCompare(b.name));
}

export function generateGroceryItemsFromMeals(meals: MealPlanEntry[], recipes: Recipe[]) {
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));

  return consolidateGroceryItems(
    meals.flatMap((meal) => {
      const recipe = recipeMap.get(meal.recipeId);
      return recipe ? scaleIngredients(recipe, recipe.servings * meal.servings).map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        section: ingredient.section
      })) : [];
    })
  );
}

export function daysUntil(date: string) {
  const target = new Date(`${date}T12:00:00`).getTime();
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.ceil((target - today.getTime()) / 86_400_000);
}

export function rollingAverage(entries: DailyLog[], windowSize = 7) {
  return entries.map((entry, index) => {
    const window = entries.slice(Math.max(0, index - windowSize + 1), index + 1);
    const average = window.reduce((total, item) => total + item.weight, 0) / Math.max(window.length, 1);
    return { date: entry.date, value: Number(average.toFixed(1)) };
  });
}

export function epleyOneRepMax(weight: number, reps: number) {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function adherence(actual: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((actual / target) * 100));
}
