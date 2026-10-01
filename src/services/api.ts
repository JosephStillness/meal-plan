import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  createSession,
  currentUser,
  deleteSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { categories, searchText, vietnameseFirst } from "@/lib/recipes";
import { generateGroceries, supportedUnits } from "./grocery";
import { recipeInclude, toRecipe, visibleRecipes } from "./recipes";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
function fail(status: number, message: string): never {
  throw new ApiError(status, message);
}
const json = (data: unknown, status = 200, headers?: HeadersInit) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
const text = (value: unknown, name: string, max = 200) =>
  typeof value === "string" && value.trim() && value.trim().length <= max
    ? value.trim()
    : fail(400, `Invalid ${name}`);
const number = (value: unknown, name: string, min = 0, max = 100000) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max
    ? value
    : fail(400, `Invalid ${name}`);
const integer = (value: unknown, name: string, min: number, max: number) => {
  const n = number(value, name, min, max);
  return Number.isInteger(n) ? n : fail(400, `Invalid ${name}`);
};
const unit = (value: unknown) =>
  typeof value === "string" && supportedUnits.includes(value)
    ? value
    : fail(400, "Unsupported unit");

function weekDate(value: unknown) {
  const date = text(value, "week start date", 10);
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date ||
    parsed.getUTCDay() !== 1
  )
    fail(400, "Week must start on a valid Monday");
  return parsed;
}

async function body(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    fail(415, "Use application/json");
  const source = await request.text();
  if (source.length > 65536) fail(413, "Request is too large");
  try {
    const value = JSON.parse(source);
    if (!value || typeof value !== "object" || Array.isArray(value))
      fail(400, "Expected a JSON object");
    return value;
  } catch {
    return fail(400, "Invalid JSON");
  }
}

// Local rate limit; use API Gateway throttling/WAF when migrating to multiple Lambda instances.
const loginAttempts = new Map<string, { count: number; until: number }>();
function limitLogin(request: Request, email: string) {
  const key = `${request.headers.get("x-forwarded-for") ?? "local"}:${email}`;
  const now = Date.now();
  for (const [key, value] of loginAttempts)
    if (value.until < now) loginAttempts.delete(key);
  const attempt = loginAttempts.get(key) ?? { count: 0, until: now + 600000 };
  if (++attempt.count > 15)
    fail(429, "Too many attempts. Try again in 10 minutes.");
  loginAttempts.set(key, attempt);
}

export async function handleApi(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const path = url.pathname
      .replace(/^\/api\/?/, "")
      .split("/")
      .filter(Boolean);
    const [resource, id, child, childId] = path;
    const method = request.method;
    if (!["GET", "HEAD"].includes(method)) {
      const origin = request.headers.get("origin");
      const expectedOrigin =
        process.env.APP_ORIGIN ??
        `${url.protocol}//${request.headers.get("host") ?? url.host}`;
      if (origin && origin !== expectedOrigin)
        fail(403, "Cross-origin requests are not allowed");
    }

    if (resource === "auth") {
      if (id === "me" && method === "GET")
        return json({ user: await currentUser(request) });
      if (id === "logout" && method === "POST")
        return json({ ok: true }, 200, {
          "Set-Cookie": await deleteSession(request),
        });
      if (["login", "register"].includes(id) && method === "POST") {
        const data = await body(request);
        const email = text(data.email, "email", 254).toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          fail(400, "Enter a valid email address");
        const password =
          typeof data.password === "string" &&
          data.password.length >= 8 &&
          data.password.length <= 128
            ? data.password
            : fail(400, "Password must contain 8–128 characters");
        limitLogin(request, email);
        const user =
          id === "register"
            ? await db.user.create({
                data: {
                  email,
                  name: text(data.name, "name", 80),
                  passwordHash: await hashPassword(password),
                },
              })
            : await db.user.findUnique({ where: { email } });
        if (id === "login") {
          const hash =
            user?.passwordHash ??
            (await hashPassword("unused-password-for-timing"));
          if (!(await verifyPassword(password, hash)) || !user)
            fail(401, "Email or password is incorrect");
        }
        if (!user) fail(401, "Email or password is incorrect");
        return json(
          { user: { id: user.id, email: user.email, name: user.name } },
          id === "register" ? 201 : 200,
          { "Set-Cookie": await createSession(user.id) },
        );
      }
      return fail(404, "Endpoint not found");
    }

    const user = await currentUser(request);
    if (resource === "ingredients" && method === "GET" && !id)
      return json(await db.ingredient.findMany({ orderBy: { name: "asc" } }));
    if (resource === "recipes" && method === "GET") {
      if (id) {
        const recipe = await db.recipe.findFirst({
          where: { id, ...visibleRecipes(user?.id) },
          include: recipeInclude,
        });
        return recipe ? json(toRecipe(recipe)) : fail(404, "Recipe not found");
      }
      const all = await db.recipe.findMany({
        where: visibleRecipes(user?.id),
        include: recipeInclude,
        orderBy: { createdAt: "asc" },
      });
      const q = searchText((url.searchParams.get("q") ?? "").trim());
      const category = url.searchParams.get("category");
      const maxTime = url.searchParams.get("maxTime"),
        maxCalories = url.searchParams.get("maxCalories"),
        minProtein = url.searchParams.get("minProtein");
      for (const [name, value] of Object.entries({
        maxTime,
        maxCalories,
        minProtein,
      }))
        if (
          value !== null &&
          (!Number.isFinite(Number(value)) || Number(value) < 0)
        )
          fail(400, `Invalid ${name}`);
      return json(
        all
          .map(toRecipe)
          .sort(vietnameseFirst)
          .filter(
            (r) =>
              (!q ||
                searchText(
                  `${r.name} ${r.subtitle} ${r.tags.join(" ")}`,
                ).includes(q)) &&
              (!category || r.tags.includes(category)) &&
              (!maxTime || r.time <= Number(maxTime)) &&
              (!maxCalories ||
                (r.calories > 0 && r.calories <= Number(maxCalories))) &&
              (!minProtein || r.protein >= Number(minProtein)) &&
              (!url.searchParams.get("difficulty") ||
                r.difficulty === url.searchParams.get("difficulty")),
          ),
      );
    }

    if (!user) fail(401, "Please sign in to save your kitchen.");

    if (
      resource === "recipes" &&
      ((method === "POST" && !id) || (method === "PATCH" && id))
    ) {
      if (
        id &&
        !(await db.recipe.findFirst({ where: { id, ownerId: user.id } }))
      )
        fail(404, "Không tìm thấy công thức riêng của bạn.");
      const data = await body(request);
      if (
        !Array.isArray(data.ingredients) ||
        !data.ingredients.length ||
        data.ingredients.length > 60
      )
        fail(400, "Thêm từ 1 đến 60 nguyên liệu.");
      if (!Array.isArray(data.steps) || data.steps.length > 30)
        fail(400, "Tối đa 30 bước nấu.");
      const image = data.image
        ? text(data.image, "image URL", 2000)
        : "/images/recipe-placeholder.svg";
      if (
        !(URL.canParse(image) && new URL(image).protocol === "https:") &&
        !/^\/images\/[a-zA-Z0-9_.-]+$/.test(image)
      )
        fail(400, "Ảnh phải dùng HTTPS hoặc đường dẫn /images/.");
      const difficulty =
        data.difficulty === "Easy" || data.difficulty === "Medium"
          ? data.difficulty
          : fail(400, "Invalid difficulty");
      const recipeData = {
        name: text(data.name, "recipe name"),
        description: data.description
          ? text(data.description, "description", 1000)
          : "Công thức theo khẩu vị của bạn.",
        imageUrl: image,
        cookingTime: integer(data.cookingTime, "cooking time", 1, 1440),
        servings: integer(data.servings, "servings", 1, 12),
        calories: integer(data.calories ?? 0, "calories", 0, 5000),
        protein: number(data.protein ?? 0, "protein", 0, 500),
        difficulty,
        category: text(data.category, "category", 40),
        tags: Array.isArray(data.tags)
          ? data.tags.slice(0, 10).map((tag) => text(tag, "tag", 40))
          : [],
        instructions: data.steps.map((step) =>
          text(step, "cooking step", 2000),
        ),
      };
      const entries = data.ingredients.map((entry) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry))
          return fail(400, "Invalid ingredient");
        return {
          ingredientId: entry.ingredientId
            ? text(entry.ingredientId, "ingredient ID")
            : undefined,
          name: entry.ingredientId
            ? undefined
            : text(entry.name, "ingredient name", 80)
                .normalize("NFC")
                .replace(/\s+/g, " ")
                .toLocaleLowerCase("vi"),
          category: entry.ingredientId
            ? undefined
            : categories.includes(entry.category)
              ? entry.category
              : fail(400, "Invalid ingredient category"),
          quantity: number(entry.quantity, "quantity", 0.001),
          unit: unit(entry.unit),
        };
      });
      const recipe = await db.$transaction(async (tx) => {
        const ingredients = new Map<
          string,
          { ingredientId: string; quantity: number; unit: string }
        >();
        for (const entry of entries) {
          const ingredient = entry.ingredientId
            ? await tx.ingredient.findUnique({
                where: { id: entry.ingredientId },
              })
            : ((await tx.ingredient.findFirst({
                where: { name: { equals: entry.name!, mode: "insensitive" } },
              })) ??
              (await tx.ingredient.upsert({
                where: { name: entry.name! },
                create: {
                  name: entry.name!,
                  category: entry.category!,
                  defaultUnit: entry.unit,
                },
                update: {},
              })));
          if (!ingredient) return fail(400, "Không tìm thấy nguyên liệu.");
          const key = ingredient.id + ":" + entry.unit;
          ingredients.set(key, {
            ingredientId: ingredient.id,
            unit: entry.unit,
            quantity: number(
              (ingredients.get(key)?.quantity ?? 0) + entry.quantity,
              "total quantity",
              0.001,
            ),
          });
        }
        const rows = [...ingredients.values()];
        return id
          ? tx.recipe.update({
              where: { id },
              data: {
                ...recipeData,
                ingredients: { deleteMany: {}, create: rows },
              },
              include: recipeInclude,
            })
          : tx.recipe.create({
              data: {
                ...recipeData,
                ownerId: user.id,
                ingredients: { create: rows },
              },
              include: recipeInclude,
            });
      });
      return json(toRecipe(recipe), id ? 200 : 201);
    }

    if (resource === "meal-plans") {
      if (!id && method === "GET")
        return json(
          await db.mealPlan.findMany({
            where: {
              userId: user.id,
              ...(url.searchParams.has("week")
                ? { weekStartDate: weekDate(url.searchParams.get("week")) }
                : {}),
            },
            include: { items: true },
            orderBy: { weekStartDate: "desc" },
          }),
        );
      if (!id && method === "POST") {
        const data = await body(request),
          weekStartDate = weekDate(data.weekStartDate);
        return json(
          await db.mealPlan.upsert({
            where: { userId_weekStartDate: { userId: user.id, weekStartDate } },
            create: { userId: user.id, weekStartDate },
            update: {},
            include: { items: true },
          }),
          201,
        );
      }
      const plan = await db.mealPlan.findFirst({
        where: { id, userId: user.id },
      });
      if (!plan) fail(404, "Meal plan not found");
      if (child === "items" && method === "POST") {
        const data = await body(request);
        const dayOfWeek = integer(data.dayOfWeek, "day of week", 0, 6);
        const recipeId = text(data.recipeId, "recipe ID");
        if (
          !(await db.recipe.findFirst({
            where: { id: recipeId, ...visibleRecipes(user.id) },
          }))
        )
          fail(404, "Recipe not found");
        return json(
          await db.mealPlanItem.upsert({
            where: { mealPlanId_dayOfWeek: { mealPlanId: plan.id, dayOfWeek } },
            create: {
              mealPlanId: plan.id,
              recipeId,
              dayOfWeek,
              servings: integer(data.servings, "servings", 1, 12),
            },
            update: {
              recipeId,
              servings: integer(data.servings, "servings", 1, 12),
            },
          }),
          201,
        );
      }
      if (child === "items" && method === "DELETE") {
        const result = await db.mealPlanItem.deleteMany({
          where: { mealPlanId: plan.id, ...(childId ? { id: childId } : {}) },
        });
        if (childId && !result.count) fail(404, "Meal not found");
        return json({ ok: true });
      }
      if (!child && method === "GET")
        return json(
          await db.mealPlan.findUnique({
            where: { id: plan.id },
            include: { items: true },
          }),
        );
    }

    if (resource === "pantry") {
      if (!id && method === "GET")
        return json(
          await db.pantryItem.findMany({
            where: { userId: user.id },
            include: { ingredient: true },
            orderBy: { ingredient: { name: "asc" } },
          }),
        );
      if (!id && method === "POST") {
        const data = await body(request),
          ingredientId = text(data.ingredientId, "ingredient ID"),
          u = unit(data.unit),
          quantity = number(data.quantity, "quantity", 0.001);
        return json(
          await db.pantryItem.upsert({
            where: {
              userId_ingredientId_unit: {
                userId: user.id,
                ingredientId,
                unit: u,
              },
            },
            create: { userId: user.id, ingredientId, unit: u, quantity },
            update: { quantity },
            include: { ingredient: true },
          }),
          201,
        );
      }
      if (id && ["DELETE", "PATCH"].includes(method)) {
        const item = await db.pantryItem.findFirst({
          where: { id, userId: user.id },
        });
        if (!item) fail(404, "Pantry item not found");
        if (method === "DELETE") {
          await db.pantryItem.delete({ where: { id } });
          return json({ ok: true });
        }
        const data = await body(request);
        return json(
          await db.pantryItem.update({
            where: { id },
            data: {
              quantity: number(data.quantity, "quantity", 0.001),
              unit: unit(data.unit),
            },
            include: { ingredient: true },
          }),
        );
      }
    }

    if (resource === "shopping-list") {
      if (id === "generate" && method === "POST") {
        const data = await body(request),
          mealPlanId = text(data.mealPlanId, "meal plan ID");
        const list = await db.$transaction(async (tx) => {
          const plan = await tx.mealPlan.findFirst({
            where: { id: mealPlanId, userId: user.id },
            include: {
              items: {
                include: { recipe: { include: { ingredients: true } } },
              },
            },
          });
          if (!plan) return fail(404, "Meal plan not found");
          const pantry = await tx.pantryItem.findMany({
            where: { userId: user.id },
          });
          const quantities = generateGroceries(plan.items, pantry);
          const list = await tx.shoppingList.upsert({
            where: { mealPlanId },
            create: { mealPlanId, userId: user.id },
            update: {},
          });
          await tx.shoppingListItem.deleteMany({
            where: { shoppingListId: list.id },
          });
          if (quantities.length)
            await tx.shoppingListItem.createMany({
              data: quantities.map((item) => ({
                ...item,
                shoppingListId: list.id,
              })),
            });
          return tx.shoppingList.findUnique({
            where: { id: list.id },
            include: {
              items: {
                include: { ingredient: true },
                orderBy: { ingredient: { name: "asc" } },
              },
            },
          });
        });
        return json(list);
      }
      if (!id && method === "GET") {
        const planId = text(url.searchParams.get("mealPlanId"), "meal plan ID");
        return json(
          await db.shoppingList.findFirst({
            where: { mealPlanId: planId, userId: user.id },
            include: {
              items: {
                include: { ingredient: true },
                orderBy: { ingredient: { name: "asc" } },
              },
            },
          }),
        );
      }
      const list = await db.shoppingList.findFirst({
        where: { id, userId: user.id },
      });
      if (!list) fail(404, "Shopping list not found");
      if (child === "items" && !childId && method === "POST") {
        const data = await body(request);
        let ingredientId: string;
        if (data.ingredientId)
          ingredientId = text(data.ingredientId, "ingredient ID");
        else {
          const name = text(data.name, "ingredient name", 80);
          const category =
            typeof data.category === "string" &&
            categories.includes(data.category as (typeof categories)[number])
              ? data.category
              : fail(400, "Invalid category");
          const ingredient = await db.ingredient.upsert({
            where: { name },
            create: { name, category, defaultUnit: unit(data.unit) },
            update: {},
          });
          ingredientId = ingredient.id;
        }
        const u = unit(data.unit),
          quantity = number(data.quantity, "quantity", 0.001);
        return json(
          await db.shoppingListItem.upsert({
            where: {
              shoppingListId_ingredientId_unit: {
                shoppingListId: list.id,
                ingredientId,
                unit: u,
              },
            },
            create: {
              shoppingListId: list.id,
              ingredientId,
              quantity,
              unit: u,
            },
            update: { quantity: { increment: quantity }, isPurchased: false },
            include: { ingredient: true },
          }),
          201,
        );
      }
      if (
        child === "items" &&
        childId &&
        ["PATCH", "DELETE"].includes(method)
      ) {
        const item = await db.shoppingListItem.findFirst({
          where: { id: childId, shoppingListId: list.id },
        });
        if (!item) fail(404, "Shopping item not found");
        if (method === "DELETE") {
          await db.shoppingListItem.delete({ where: { id: childId } });
          return json({ ok: true });
        }
        const data = await body(request);
        if (
          data.isPurchased !== undefined &&
          typeof data.isPurchased !== "boolean"
        )
          fail(400, "Invalid purchased status");
        return json(
          await db.shoppingListItem.update({
            where: { id: childId },
            data: {
              ...(data.quantity !== undefined
                ? {
                    quantity: number(data.quantity, "quantity", 0.001),
                  }
                : {}),
              ...(data.unit !== undefined ? { unit: unit(data.unit) } : {}),
              ...(data.isPurchased !== undefined
                ? { isPurchased: data.isPurchased as boolean }
                : {}),
            },
            include: { ingredient: true },
          }),
        );
      }
    }
    return fail(404, "Endpoint not found");
  } catch (error) {
    if (error instanceof ApiError)
      return json({ error: error.message }, error.status);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002")
        return json({ error: "This email or item already exists." }, 409);
      if (error.code === "P2003")
        return json(
          { error: "The referenced recipe or ingredient does not exist." },
          400,
        );
      if (error.code === "P2025")
        return json({ error: "Item not found." }, 404);
    }
    console.error("MealMate API error:", error);
    return json(
      {
        error:
          "Unable to complete the request. Check the database connection and try again.",
      },
      503,
    );
  }
}
