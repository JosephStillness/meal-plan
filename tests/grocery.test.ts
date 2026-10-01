import { test } from "node:test";
import assert from "node:assert/strict";
import { generateGroceries, groupGroceries } from "../src/services/grocery";

test("scales servings, combines compatible units and subtracts pantry quantities once", () => {
  const result = generateGroceries(
    [
      {
        servings: 4,
        recipe: {
          servings: 2,
          ingredients: [
            { ingredientId: "rice", quantity: 250, unit: "g" },
            { ingredientId: "garlic", quantity: 3, unit: "cloves" },
          ],
        },
      },
      {
        servings: 1,
        recipe: {
          servings: 2,
          ingredients: [
            { ingredientId: "rice", quantity: 1, unit: "kg" },
            { ingredientId: "garlic", quantity: 4, unit: "cloves" },
          ],
        },
      },
    ],
    [
      { ingredientId: "rice", quantity: 0.2, unit: "kg" },
      { ingredientId: "garlic", quantity: 1, unit: "cloves" },
    ],
  );
  assert.deepEqual(result, [
    { ingredientId: "rice", quantity: 800, unit: "g" },
    { ingredientId: "garlic", quantity: 7, unit: "cloves" },
  ]);
});
test("normalizes volume and spoons, keeps incompatible dimensions separate, and caps pantry deductions", () => {
  const result = generateGroceries(
    [
      {
        servings: 2,
        recipe: {
          servings: 2,
          ingredients: [
            { ingredientId: "oil", quantity: 1, unit: "l" },
            { ingredientId: "oil", quantity: 200, unit: "ml" },
            { ingredientId: "oil", quantity: 10, unit: "g" },
            { ingredientId: "salt", quantity: 1, unit: "tbsp" },
            { ingredientId: "salt", quantity: 1, unit: "tsp" },
          ],
        },
      },
    ],
    [
      { ingredientId: "oil", quantity: 1.3, unit: "l" },
      { ingredientId: "salt", quantity: 2, unit: "tsp" },
    ],
  );
  assert.deepEqual(result, [
    { ingredientId: "oil", quantity: 10, unit: "g" },
    { ingredientId: "salt", quantity: 2, unit: "tsp" },
  ]);
});
test("handles empty plans and rejects invalid quantities", () => {
  assert.deepEqual(generateGroceries([], []), []);
  assert.throws(
    () =>
      generateGroceries(
        [{ servings: 0, recipe: { servings: 2, ingredients: [] } }],
        [],
      ),
    /Invalid serving/,
  );
  assert.throws(
    () =>
      generateGroceries(
        [],
        [{ ingredientId: "rice", quantity: NaN, unit: "g" }],
      ),
    /Invalid pantry/,
  );
});
test("returns grocery fields only when inputs come from ORM records", () => {
  const record = {
    id: "recipe-ingredient-row",
    recipeId: "pasta-recipe",
    ingredientId: "pasta",
    quantity: 200,
    unit: "g",
  };
  assert.deepEqual(
    generateGroceries(
      [{ servings: 2, recipe: { servings: 2, ingredients: [record] } }],
      [],
    ),
    [{ ingredientId: "pasta", quantity: 200, unit: "g" }],
  );
});
test("groups grocery items by the ingredient category", () => {
  const items = [
    { id: "a", ingredient: { category: "Vegetables" } },
    { id: "b", ingredient: { category: "Grains" } },
    { id: "c", ingredient: { category: "Vegetables" } },
  ];
  assert.deepEqual(groupGroceries(items), {
    Vegetables: [items[0], items[2]],
    Grains: [items[1]],
  });
});

test("keeps bunches, packets and pieces distinct from weight when scaling personal recipes", () => {
  const result = generateGroceries(
    [
      {
        servings: 4,
        recipe: {
          servings: 2,
          ingredients: [
            { ingredientId: "rau", quantity: 1, unit: "bunch" },
            { ingredientId: "rau", quantity: 100, unit: "g" },
            { ingredientId: "tofu", quantity: 1, unit: "packet" },
            { ingredientId: "tofu", quantity: 3, unit: "pieces" },
          ],
        },
      },
    ],
    [{ ingredientId: "rau", quantity: 1, unit: "bunch" }],
  );
  assert.deepEqual(result, [
    { ingredientId: "rau", quantity: 1, unit: "bunch" },
    { ingredientId: "rau", quantity: 200, unit: "g" },
    { ingredientId: "tofu", quantity: 2, unit: "packet" },
    { ingredientId: "tofu", quantity: 6, unit: "pieces" },
  ]);
});
