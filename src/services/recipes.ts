import type { Prisma } from "@prisma/client";
import type { Recipe } from "@/lib/recipes";

export const visibleRecipes = (userId?: string): Prisma.RecipeWhereInput => ({
  OR: [{ ownerId: null }, ...(userId ? [{ ownerId: userId }] : [])],
});

export const recipeInclude = {
  ingredients: { include: { ingredient: true } },
} as const;
type DatabaseRecipe = Prisma.RecipeGetPayload<{
  include: typeof recipeInclude;
}>;

export function toRecipe(recipe: DatabaseRecipe): Recipe {
  return {
    id: recipe.id,
    ownerId: recipe.ownerId,
    name: recipe.name,
    subtitle: recipe.description,
    image: recipe.imageUrl,
    time: recipe.cookingTime,
    difficulty: recipe.difficulty as Recipe["difficulty"],
    calories: recipe.calories,
    protein: recipe.protein,
    category: recipe.category,
    servings: recipe.servings,
    tags: recipe.tags,
    steps: recipe.instructions,
    ingredients: recipe.ingredients.map((i) => ({
      ingredientId: i.ingredientId,
      quantity: i.quantity,
      unit: i.unit,
    })),
  };
}
