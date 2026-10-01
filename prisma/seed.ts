import { PrismaClient } from "@prisma/client";
import { ingredients, recipes } from "../src/lib/recipes";
const db = new PrismaClient();

async function main() {
  for (const ingredient of ingredients) {
    const defaultUnit =
      recipes
        .flatMap((r) => r.ingredients)
        .find((i) => i.ingredientId === ingredient.id)?.unit ?? "g";
    await db.ingredient.upsert({
      where: { id: ingredient.id },
      create: { ...ingredient, defaultUnit },
      update: { ...ingredient, defaultUnit },
    });
  }
  for (const recipe of recipes) {
    const data = {
      name: recipe.name,
      description: recipe.subtitle,
      imageUrl: recipe.image,
      cookingTime: recipe.time,
      difficulty: recipe.difficulty,
      calories: recipe.calories,
      protein: recipe.protein,
      servings: recipe.servings,
      category: recipe.category,
      tags: recipe.tags,
      instructions: recipe.steps,
    };
    await db.recipe.upsert({
      where: { id: recipe.id },
      create: {
        id: recipe.id,
        ...data,
        ingredients: { create: recipe.ingredients },
      },
      update: data,
    });
  }
  console.log(
    `Seeded ${ingredients.length} ingredients and ${recipes.length} recipes. Register your own local account in the app.`,
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
