import { headers } from "next/headers";
import { currentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { recipeInclude, toRecipe, visibleRecipes } from "@/services/recipes";
import { RecipeDetail } from "@/components/recipe-detail";

export const dynamic = "force-dynamic";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser(
    new Request("http://localhost", { headers: await headers() }),
  );
  const recipe = await db.recipe.findFirst({
    where: { id, ...visibleRecipes(user?.id) },
    include: recipeInclude,
  });
  if (!recipe) notFound();
  return <RecipeDetail recipe={toRecipe(recipe)} />;
}
