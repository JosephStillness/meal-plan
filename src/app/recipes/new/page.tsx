import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { recipeInclude, toRecipe, visibleRecipes } from "@/services/recipes";
import { RecipeEditor } from "@/components/recipe-editor";

export default async function NewRecipePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  if (!from) return <RecipeEditor />;
  const user = await currentUser(
    new Request("http://localhost", { headers: await headers() }),
  );
  const recipe = await db.recipe.findFirst({
    where: { id: from, ...visibleRecipes(user?.id) },
    include: recipeInclude,
  });
  if (!recipe) notFound();
  return <RecipeEditor recipe={toRecipe(recipe)} />;
}
