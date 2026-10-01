export type Quantity = { ingredientId: string; quantity: number; unit: string };
export type GroceryRecipe = { servings: number; ingredients: Quantity[] };
export type GroceryMeal = { servings: number; recipe: GroceryRecipe };

const conversions: Record<string, { unit: string; factor: number }> = {
  g: { unit: "g", factor: 1 },
  kg: { unit: "g", factor: 1000 },
  ml: { unit: "ml", factor: 1 },
  l: { unit: "ml", factor: 1000 },
  tsp: { unit: "tsp", factor: 1 },
  tbsp: { unit: "tsp", factor: 3 },
};
export const supportedUnits = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "whole",
  "cloves",
  "bunch",
  "packet",
  "pieces",
];

export function normalize(item: Quantity): Quantity {
  const conversion = conversions[item.unit.toLowerCase()];
  return {
    ingredientId: item.ingredientId,
    quantity: item.quantity * (conversion?.factor ?? 1),
    unit: conversion?.unit ?? item.unit.toLowerCase(),
  };
}

export function generateGroceries(
  meals: GroceryMeal[],
  pantry: Quantity[],
): Quantity[] {
  const totals = new Map<string, Quantity>();
  for (const meal of meals) {
    if (
      !Number.isFinite(meal.servings) ||
      meal.servings <= 0 ||
      !Number.isFinite(meal.recipe.servings) ||
      meal.recipe.servings <= 0
    )
      throw new Error("Invalid serving size");
    for (const entry of meal.recipe.ingredients) {
      if (!Number.isFinite(entry.quantity) || entry.quantity < 0)
        throw new Error("Invalid ingredient quantity");
      const item = normalize({
        ...entry,
        quantity: (entry.quantity * meal.servings) / meal.recipe.servings,
      });
      const key = `${item.ingredientId}:${item.unit}`;
      const previous = totals.get(key);
      totals.set(key, {
        ...item,
        quantity: (previous?.quantity ?? 0) + item.quantity,
      });
    }
  }
  // Only compatible units can be subtracted: grams and millilitres need density to convert.
  for (const entry of pantry) {
    if (!Number.isFinite(entry.quantity) || entry.quantity < 0)
      throw new Error("Invalid pantry quantity");
    const item = normalize(entry);
    const required = totals.get(`${item.ingredientId}:${item.unit}`);
    if (required)
      required.quantity = Math.max(0, required.quantity - item.quantity);
  }
  return [...totals.values()]
    .map((item) => ({ ...item, quantity: Number(item.quantity.toFixed(4)) }))
    .filter((item) => item.quantity > 0);
}

export function groupGroceries<T extends { ingredient: { category: string } }>(
  items: T[],
) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    (groups[item.ingredient.category] ??= []).push(item);
    return groups;
  }, {});
}
