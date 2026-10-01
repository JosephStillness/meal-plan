import type { Ingredient } from "@/lib/recipes";
export type User = { id: string; name: string; email: string };
export type PlanItem = {
  id: string;
  recipeId: string;
  dayOfWeek: number;
  servings: number;
};
export type MealPlan = { id: string; weekStartDate: string; items: PlanItem[] };
export type PantryItem = {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  ingredient: Ingredient;
};
export type ListItem = {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  isPurchased: boolean;
  ingredient: Ingredient;
};
export type ShoppingList = {
  id: string;
  mealPlanId: string;
  items: ListItem[];
};
