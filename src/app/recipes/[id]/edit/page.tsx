import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { recipeInclude, toRecipe } from "@/services/recipes";
import { RecipeEditor } from "@/components/recipe-editor";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser(
    new Request("http://localhost", { headers: await headers() }),
  );
  if (!user) notFound();
  const { id } = await params;
  const recipe = await db.recipe.findFirst({
    where: { id, ownerId: user.id },
    include: recipeInclude,
  });
  if (!recipe) notFound();
  return <RecipeEditor recipe={toRecipe(recipe)} editing />;
}
