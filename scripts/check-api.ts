import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import type { ListItem } from "../src/types/api";
const db = new PrismaClient();
const origin = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const users: string[] = [];
const testIngredients: string[] = [];
const testRecipes: string[] = [];
async function request(
  path: string,
  method = "GET",
  body?: unknown,
  cookie = "",
  status = 200,
) {
  const response = await fetch(`${origin}/api/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: process.env.APP_ORIGIN ?? origin,
      Cookie: cookie,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  assert.equal(
    response.status,
    status,
    `${method} ${path}: ${JSON.stringify(data)}`,
  );
  return {
    data,
    cookie: response.headers.get("set-cookie")?.split(";")[0] ?? cookie,
  };
}
async function main() {
  const { data: recipes } = await request("recipes");
  assert.ok(recipes.length >= 12);
  const recipe = (await request("recipes/beef-pasta")).data;
  assert.equal(recipe.name, "Classic beef pasta");
  await request("pantry", "GET", undefined, "", 401);
  const email = `test-${randomUUID()}@example.test`,
    password = randomUUID();
  const auth = await request(
    "auth/register",
    "POST",
    { name: "API verification", email, password },
    "",
    201,
  );
  users.push(auth.data.user.id);
  const cookie = auth.cookie;
  const createdRecipe = (
    await request(
      "recipes",
      "POST",
      {
        name: "API sample recipe",
        description: "Temporary verification recipe",
        image: "/images/pesto-pasta.jpg",
        cookingTime: 15,
        difficulty: "Easy",
        calories: 400,
        protein: 25,
        servings: 2,
        category: "Italian",
        tags: ["Italian"],
        steps: ["Cook and serve."],
        ingredients: [{ ingredientId: "pasta", quantity: 200, unit: "g" }],
      },
      cookie,
      201,
    )
  ).data;
  testRecipes.push(createdRecipe.id);
  assert.equal(
    (await request(`recipes/${createdRecipe.id}`, "GET", undefined, cookie))
      .data.ingredients[0].quantity,
    200,
  );

  await request(`recipes/${createdRecipe.id}`, "GET", undefined, "", 404);
  assert.ok(
    !(await request("recipes")).data.some(
      (r: { id: string }) => r.id === createdRecipe.id,
    ),
  );
  const search = (await request("recipes?q=thit%20kho&category=Vietnamese"))
    .data;
  assert.ok(search.some((r: { id: string }) => r.id === "thit-kho-trung"));
  assert.equal(recipes[0].tags.includes("Vietnamese"), true);
  await request("recipes/thit-kho-trung", "PATCH", {}, cookie, 404);
  const customName = `Nấm hương ${randomUUID()}`;
  const personalData = {
    name: "Gà kho theo khẩu vị riêng",
    servings: 2,
    cookingTime: 25,
    difficulty: "Easy",
    category: "Vietnamese",
    tags: ["Vietnamese"],
    steps: [],
    ingredients: [
      { name: customName, category: "Vegetables", quantity: 100, unit: "g" },
      {
        name: customName.toLocaleLowerCase("vi"),
        category: "Vegetables",
        quantity: 50,
        unit: "g",
      },
      { ingredientId: "chicken", quantity: 250, unit: "g" },
    ],
  };
  await request(
    "recipes",
    "POST",
    { ...personalData, image: "https://" },
    cookie,
    400,
  );
  const personalized = (
    await request(`recipes/${createdRecipe.id}`, "PATCH", personalData, cookie)
  ).data;
  assert.equal(personalized.ownerId, users[0]);
  assert.equal(personalized.image, "/images/recipe-placeholder.svg");
  assert.equal(personalized.ingredients.length, 2);
  const customIngredient = personalized.ingredients.find(
    (i: { ingredientId: string }) => i.ingredientId !== "chicken",
  );
  testIngredients.push(customIngredient.ingredientId);
  assert.equal(customIngredient.quantity, 150);
  const rollbackName = `Rollback ${randomUUID()}`;
  await request(
    "recipes",
    "POST",
    {
      ...personalData,
      ingredients: [
        {
          name: rollbackName,
          category: "Vegetables",
          quantity: 100,
          unit: "g",
        },
        { ingredientId: "nonexistent-ingredient", quantity: 100, unit: "g" },
      ],
    },
    cookie,
    400,
  );
  assert.equal(
    await db.ingredient.count({ where: { name: rollbackName.toLowerCase() } }),
    0,
  );

  assert.equal(
    (await request("auth/me", "GET", undefined, cookie)).data.user.id,
    users[0],
  );
  const plan = (
    await request(
      "meal-plans",
      "POST",
      { weekStartDate: "2026-09-28" },
      cookie,
      201,
    )
  ).data;
  await request(
    `meal-plans/${plan.id}/items`,
    "POST",
    { recipeId: "beef-pasta", dayOfWeek: 0, servings: 4 },
    cookie,
    201,
  );
  const meal = (
    await request(
      `meal-plans/${plan.id}/items`,
      "POST",
      { recipeId: "pesto-pasta", dayOfWeek: 1, servings: 2 },
      cookie,
      201,
    )
  ).data;
  await request(
    `meal-plans/${plan.id}/items`,
    "POST",
    { recipeId: "beef-pasta", dayOfWeek: 2, servings: -1 },
    cookie,
    400,
  );
  const pantry = (
    await request(
      "pantry",
      "POST",
      { ingredientId: "pasta", quantity: 0.2, unit: "kg" },
      cookie,
      201,
    )
  ).data;
  const list = (
    await request(
      "shopping-list/generate",
      "POST",
      { mealPlanId: plan.id },
      cookie,
    )
  ).data;
  assert.equal(
    list.items.find((i: ListItem) => i.ingredientId === "pasta").quantity,
    400,
  );
  assert.equal(
    list.items.find((i: ListItem) => i.ingredientId === "garlic").quantity,
    8,
  );
  assert.equal(
    list.items.filter((i: ListItem) => i.ingredientId === "garlic").length,
    1,
  );

  await request(
    `meal-plans/${plan.id}/items`,
    "POST",
    { recipeId: createdRecipe.id, dayOfWeek: 2, servings: 4 },
    cookie,
    201,
  );
  await request(
    "pantry",
    "POST",
    { ingredientId: customIngredient.ingredientId, quantity: 50, unit: "g" },
    cookie,
    201,
  );
  const customList = (
    await request(
      "shopping-list/generate",
      "POST",
      { mealPlanId: plan.id },
      cookie,
    )
  ).data;
  assert.equal(
    customList.items.find(
      (i: ListItem) => i.ingredientId === customIngredient.ingredientId,
    ).quantity,
    250,
  );
  // Editing a planned recipe keeps its identity; only regeneration updates the saved shopping snapshot.
  await request(
    `recipes/${createdRecipe.id}`,
    "PATCH",
    {
      ...personalData,
      ingredients: [
        {
          ingredientId: customIngredient.ingredientId,
          quantity: 200,
          unit: "g",
        },
      ],
    },
    cookie,
  );
  assert.equal(
    (
      await request(
        `shopping-list?mealPlanId=${plan.id}`,
        "GET",
        undefined,
        cookie,
      )
    ).data.items.find(
      (i: ListItem) => i.ingredientId === customIngredient.ingredientId,
    ).quantity,
    250,
  );
  const regenerated = (
    await request(
      "shopping-list/generate",
      "POST",
      { mealPlanId: plan.id },
      cookie,
    )
  ).data;
  assert.equal(
    regenerated.items.find(
      (i: ListItem) => i.ingredientId === customIngredient.ingredientId,
    ).quantity,
    350,
  );
  assert.equal(
    (await request("recipes/thit-kho-trung")).data.name,
    "Thịt kho trứng",
  );

  const manual = (
    await request(
      `shopping-list/${list.id}/items`,
      "POST",
      {
        name: `Test apples ${randomUUID()}`,
        category: "Fruit",
        quantity: 3,
        unit: "whole",
      },
      cookie,
      201,
    )
  ).data;
  testIngredients.push(manual.ingredientId);
  await request(
    `shopping-list/${list.id}/items/${manual.id}`,
    "PATCH",
    { quantity: 4, isPurchased: true },
    cookie,
  );
  const editedPurchased = (
    await request(
      `shopping-list/${list.id}/items/${manual.id}`,
      "PATCH",
      { quantity: 5, unit: "whole" },
      cookie,
    )
  ).data;
  assert.equal(editedPurchased.isPurchased, true);
  const persisted = (
    await request(
      `shopping-list?mealPlanId=${plan.id}`,
      "GET",
      undefined,
      cookie,
    )
  ).data;
  assert.equal(
    persisted.items.find((i: ListItem) => i.id === manual.id).isPurchased,
    true,
  );
  assert.equal(
    persisted.items.find((i: ListItem) => i.id === manual.id).quantity,
    5,
  );
  const auth2 = await request(
    "auth/register",
    "POST",
    {
      name: "Second verification",
      email: `test-${randomUUID()}@example.test`,
      password,
    },
    "",
    201,
  );
  users.push(auth2.data.user.id);
  await request(
    `recipes/${createdRecipe.id}`,
    "GET",
    undefined,
    auth2.cookie,
    404,
  );
  await request(
    `recipes/${createdRecipe.id}`,
    "PATCH",
    personalData,
    auth2.cookie,
    404,
  );
  const plan2 = (
    await request(
      "meal-plans",
      "POST",
      { weekStartDate: "2026-09-28" },
      auth2.cookie,
      201,
    )
  ).data;
  await request(
    `meal-plans/${plan2.id}/items`,
    "POST",
    { recipeId: createdRecipe.id, dayOfWeek: 0, servings: 2 },
    auth2.cookie,
    404,
  );
  for (const path of [
    `/recipes/${createdRecipe.id}`,
    `/recipes/${createdRecipe.id}/edit`,
    `/recipes/new?from=${createdRecipe.id}`,
  ]) {
    const hidden = await fetch(origin + path, {
      headers: { Cookie: auth2.cookie },
    });
    assert.equal(hidden.status, 404, `Private page leaked: ${path}`);
  }

  await request(
    `meal-plans/${plan.id}/items`,
    "POST",
    { recipeId: "beef-pasta", dayOfWeek: 1, servings: 2 },
    auth2.cookie,
    404,
  );
  await request(`pantry/${pantry.id}`, "DELETE", undefined, auth2.cookie, 404);
  await request(
    "shopping-list/generate",
    "POST",
    { mealPlanId: plan.id },
    auth2.cookie,
    404,
  );
  await request(
    `shopping-list/${list.id}/items/${manual.id}`,
    "PATCH",
    { quantity: 1 },
    auth2.cookie,
    404,
  );
  const badOrigin = await fetch(`${origin}/api/pantry`, {
    method: "POST",
    headers: {
      Origin: "https://untrusted.example",
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ ingredientId: "rice", quantity: 100, unit: "g" }),
  });
  assert.equal(badOrigin.status, 403);
  await request(
    `meal-plans/${plan.id}/items/${meal.id}`,
    "DELETE",
    undefined,
    cookie,
  );
  await request(
    `pantry/${pantry.id}`,
    "PATCH",
    { quantity: 0.3, unit: "kg" },
    cookie,
  );
  await request(
    `shopping-list/${list.id}/items/${manual.id}`,
    "DELETE",
    undefined,
    cookie,
  );
  await request("auth/logout", "POST", {}, cookie);
  assert.equal(
    (await request("auth/me", "GET", undefined, cookie)).data.user,
    null,
  );
  await request(
    "auth/login",
    "POST",
    { email, password: "wrong-password" },
    "",
    401,
  );
  await request("auth/login", "POST", { email, password }, "", 200);

  console.log(
    "API check passed: Vietnamese discovery, private recipe creation/editing, ingredient deduplication/rollback, authentication, serving scaling, pantry subtraction, snapshot regeneration, grocery editing, CSRF and user isolation.",
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.user.deleteMany({ where: { id: { in: users } } });
    await db.recipe.deleteMany({ where: { id: { in: testRecipes } } });
    await db.ingredient.deleteMany({ where: { id: { in: testIngredients } } });
    await db.$disconnect();
  });
