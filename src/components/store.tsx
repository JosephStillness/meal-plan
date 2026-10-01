"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { days, type Ingredient, type Recipe } from "@/lib/recipes";
import type { Meal } from "@/lib/shopping";
import type { MealPlan, PantryItem, ShoppingList, User } from "@/types/api";

export async function api<T>(
  url: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const response = await fetch(`/api/${url}`, {
    method,
    headers: data === undefined ? {} : { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error ?? "Something went wrong. Try again.");
  return result;
}
export function monday(date = new Date()) {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  local.setDate(local.getDate() - ((local.getDay() + 6) % 7));
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`;
}
export function shiftWeek(week: string, offset: number) {
  const date = new Date(`${week}T12:00:00`);
  date.setDate(date.getDate() + offset * 7);
  return monday(date);
}

type Store = {
  ready: boolean;
  busy: boolean;
  error: string;
  notice: string;
  user: User | null;
  recipes: Recipe[];
  ingredients: Ingredient[];
  plan: Record<string, Meal & { id: string }>;
  mealPlan: MealPlan | null;
  pantry: string[];
  pantryItems: PantryItem[];
  saved: string[];
  shopping: ShoppingList | null;
  week: string;
  setWeek: (week: string) => void;
  setMeal: (day: string, meal: Meal | null) => Promise<void>;
  clearPlan: () => Promise<void>;
  loadSample: () => Promise<void>;
  setPantry: (id: string, quantity?: number, unit?: string) => Promise<void>;
  upsertPantry: (
    ingredientId: string,
    quantity: number,
    unit: string,
  ) => Promise<void>;
  updatePantry: (id: string, quantity: number, unit: string) => Promise<void>;
  deletePantry: (id: string) => Promise<void>;
  generateList: () => Promise<void>;
  updateListItem: (id: string, data: unknown) => Promise<void>;
  deleteListItem: (id: string) => Promise<void>;
  addListItem: (data: unknown) => Promise<void>;
  saveRecipe: (id: string) => void;
  notify: (message: string) => void;
  refreshUser: () => Promise<void>;
  refreshRecipes: () => Promise<void>;
  logout: () => Promise<void>;
  retry: () => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const mutationLock = useRef(false);
  const [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]),
    [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null),
    [pantryItems, setPantryItems] = useState<PantryItem[]>([]),
    [shopping, setShopping] = useState<ShoppingList | null>(null);
  const [saved, setSaved] = useState<string[]>([]),
    [week, setWeek] = useState(monday()),
    [reload, setReload] = useState(0);
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api<Recipe[]>("recipes"),
      api<Ingredient[]>("ingredients"),
      api<{ user: User | null }>("auth/me"),
    ])
      .then(([recipes, ingredients, auth]) => {
        if (!cancelled) {
          setRecipes(recipes);
          setIngredients(ingredients);
          setUser(auth.user);
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    try {
      const ids = JSON.parse(
        localStorage.getItem("mealmate-favourites") ?? "[]",
      );
      if (Array.isArray(ids))
        setSaved(ids.filter((id) => typeof id === "string"));
    } catch {
      /* Favourites still work for this visit. */
    }
    return () => {
      cancelled = true;
    };
  }, [reload]);
  useEffect(() => {
    let cancelled = false;
    setMealPlan(null);
    setPantryItems([]);
    setShopping(null);
    if (!user) return;
    setBusy(true);
    Promise.all([
      api<MealPlan[]>(`meal-plans?week=${week}`),
      api<PantryItem[]>("pantry"),
    ])
      .then(async ([plans, pantry]) => {
        const list = plans[0]
          ? await api<ShoppingList | null>(
              `shopping-list?mealPlanId=${plans[0].id}`,
            )
          : null;
        if (!cancelled) {
          setMealPlan(plans[0] ?? null);
          setPantryItems(pantry);
          setShopping(list);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, week]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);
  async function loadPersonal() {
    const [plans, pantry] = await Promise.all([
      api<MealPlan[]>(`meal-plans?week=${week}`),
      api<PantryItem[]>("pantry"),
    ]);
    const list = plans[0]
      ? await api<ShoppingList | null>(
          `shopping-list?mealPlanId=${plans[0].id}`,
        )
      : null;
    setMealPlan(plans[0] ?? null);
    setPantryItems(pantry);
    setShopping(list);
  }
  async function run(action: () => Promise<unknown>, message?: string) {
    if (!user) {
      router.push("/login");
      return;
    }
    if (busy || mutationLock.current) return;
    mutationLock.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
      await loadPersonal();
      if (message) setNotice(message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save. Try again.");
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  }
  const ensurePlan = async () =>
    mealPlan ??
    (await api<MealPlan>("meal-plans", "POST", { weekStartDate: week }));
  const plan = Object.fromEntries(
    (mealPlan?.items ?? []).map((item) => [
      days[item.dayOfWeek],
      { id: item.id, recipeId: item.recipeId, servings: item.servings },
    ]),
  );
  const store: Store = {
    ready,
    busy,
    error,
    notice,
    user,
    recipes,
    ingredients,
    mealPlan,
    pantryItems,
    pantry: pantryItems.map((i) => i.ingredientId),
    saved,
    shopping,
    week,
    setWeek,
    plan,
    retry: () => {
      setError("");
      setReady(false);
      setReload((n) => n + 1);
    },
    notify: setNotice,
    setMeal: async (day, meal) =>
      run(
        async () => {
          const currentPlan = await ensurePlan();
          if (meal)
            return api(`meal-plans/${currentPlan.id}/items`, "POST", {
              ...meal,
              dayOfWeek: days.indexOf(day),
            });
          const item = currentPlan.items.find(
            (item) => days[item.dayOfWeek] === day,
          );
          if (item)
            await api(
              `meal-plans/${currentPlan.id}/items/${item.id}`,
              "DELETE",
            );
        },
        meal ? `Meal saved for ${day}.` : "Meal removed.",
      ),
    clearPlan: async () =>
      run(async () => {
        if (mealPlan) await api(`meal-plans/${mealPlan.id}/items`, "DELETE");
      }, "Your week is cleared."),
    loadSample: async () =>
      run(async () => {
        const currentPlan = await ensurePlan();
        const ids = [
          "chicken-rice",
          "thit-kho-trung",
          "canh-chua-ca",
          "ga-kho-gung",
          "dau-hu-sot-ca",
          "shaking-beef",
          "bun-bo-xao",
        ];
        for (const [dayOfWeek, recipeId] of ids.entries())
          await api(`meal-plans/${currentPlan.id}/items`, "POST", {
            dayOfWeek,
            recipeId,
            servings: 2,
          });
      }, "A delicious sample week is ready. Make it your own."),
    setPantry: async (id, quantity = 1, unit = "whole") =>
      run(async () => {
        const existing = pantryItems.filter((i) => i.ingredientId === id);
        if (existing.length) {
          for (const item of existing) await api(`pantry/${item.id}`, "DELETE");
        } else
          await api("pantry", "POST", { ingredientId: id, quantity, unit });
      }),
    upsertPantry: async (ingredientId, quantity, unit) =>
      run(
        () => api("pantry", "POST", { ingredientId, quantity, unit }),
        "Pantry updated.",
      ),
    updatePantry: async (id, quantity, unit) =>
      run(
        () => api(`pantry/${id}`, "PATCH", { quantity, unit }),
        "Pantry updated.",
      ),
    deletePantry: async (id) =>
      run(() => api(`pantry/${id}`, "DELETE"), "Pantry item removed."),
    generateList: async () =>
      run(async () => {
        const currentPlan = await ensurePlan();
        await api("shopping-list/generate", "POST", {
          mealPlanId: currentPlan.id,
        });
      }, "Shopping list generated. Pantry quantities have been deducted."),
    updateListItem: async (id, data) =>
      run(async () => {
        if (shopping)
          await api(`shopping-list/${shopping.id}/items/${id}`, "PATCH", data);
      }),
    deleteListItem: async (id) =>
      run(async () => {
        if (shopping)
          await api(`shopping-list/${shopping.id}/items/${id}`, "DELETE");
      }, "Item removed."),
    addListItem: async (data) =>
      run(async () => {
        let list = shopping;
        if (!list) {
          const currentPlan = await ensurePlan();
          list = await api<ShoppingList>("shopping-list/generate", "POST", {
            mealPlanId: currentPlan.id,
          });
        }
        await api(`shopping-list/${list.id}/items`, "POST", data);
        setIngredients(await api<Ingredient[]>("ingredients"));
      }, "Item added to your list."),
    saveRecipe: (id) => {
      const next = saved.includes(id)
        ? saved.filter((x) => x !== id)
        : [...saved, id];
      setSaved(next);
      try {
        localStorage.setItem("mealmate-favourites", JSON.stringify(next));
      } catch {
        setNotice(
          "Favourite saved for this visit. Browser storage is unavailable.",
        );
      }
    },
    refreshRecipes: async () => {
      const [recipes, ingredients] = await Promise.all([
        api<Recipe[]>("recipes"),
        api<Ingredient[]>("ingredients"),
      ]);
      setRecipes(recipes);
      setIngredients(ingredients);
    },
    refreshUser: async () => {
      const [auth, recipes, ingredients] = await Promise.all([
        api<{ user: User | null }>("auth/me"),
        api<Recipe[]>("recipes"),
        api<Ingredient[]>("ingredients"),
      ]);
      setUser(auth.user);
      setRecipes(recipes);
      setIngredients(ingredients);
    },
    logout: async () => {
      try {
        await api("auth/logout", "POST", {});
        setUser(null);
        setRecipes(recipes.filter((recipe) => !recipe.ownerId));
        router.push("/");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to sign out.");
      }
    },
  };
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useStore() {
  const context = useContext(Context);
  if (!context) throw new Error("MealMate store is missing");
  return context;
}
