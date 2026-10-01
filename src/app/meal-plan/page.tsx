"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Basket,
  Clock,
  Plus,
  Trash,
  Sparkle,
  ArrowUpRight,
  CalendarDots,
} from "@phosphor-icons/react";
import { days } from "@/lib/recipes";
import { useStore } from "@/components/store";
import { KitchenGate, WeekControl } from "@/components/kitchen";
import { ServingControl } from "@/components/recipe-detail";

export default function MealPlanPage() {
  const store = useStore(),
    router = useRouter();
  const count = Object.keys(store.plan).length;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="greeting">Make room for good food</p>
          <h1>A little plan for your week.</h1>
          <p className="heading-description">
            One dinner or a whole week. Choose what works for you.
          </p>
        </div>
        <WeekControl />
      </div>
      <KitchenGate>
        <div className="planner-toolbar">
          <span>
            <CalendarDots size={20} />
            <strong>{count} of 7</strong> days planned
          </span>
          <div className="button-row">
            <button
              disabled={store.busy}
              className="button secondary"
              onClick={() => {
                if (
                  !count ||
                  confirm("Replace this week’s meals with a sample plan?")
                )
                  store.loadSample();
              }}
            >
              <Sparkle size={18} />
              Try a sample week
            </button>
            {count > 0 && (
              <button
                disabled={store.busy}
                className="icon-button"
                aria-label="Clear this week's plan"
                onClick={() => {
                  if (confirm("Remove all meals for this week?"))
                    store.clearPlan();
                }}
              >
                <Trash size={19} />
              </button>
            )}
          </div>
        </div>
        <div className="planner-grid" aria-busy={store.busy}>
          {days.map((day, index) => {
            const meal = store.plan[day],
              recipe = store.recipes.find((r) => r.id === meal?.recipeId);
            const date = new Date(`${store.week}T12:00:00`);
            date.setDate(date.getDate() + index);
            return (
              <article
                className={`day-card ${recipe ? "has-meal" : ""}`}
                key={day}
              >
                <div className="day-heading">
                  <h2>{day}</h2>
                  <span>
                    {date.getDate()}{" "}
                    {date.toLocaleDateString("en-AU", { month: "short" })}
                  </span>
                  {meal && (
                    <button
                      disabled={store.busy}
                      className="icon-button"
                      aria-label={`Remove ${day} meal`}
                      onClick={() => store.setMeal(day, null)}
                    >
                      <Trash size={17} />
                    </button>
                  )}
                </div>
                {recipe ? (
                  <>
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="day-image-link"
                    >
                      <img src={recipe.image} alt={recipe.name} />
                    </Link>
                    <div className="day-content">
                      <Link
                        href={`/recipes/${recipe.id}`}
                        className="day-recipe-name"
                      >
                        {recipe.name}
                        <ArrowUpRight size={17} />
                      </Link>
                      <span className="day-time">
                        <Clock size={15} />
                        {recipe.time} minutes · {recipe.difficulty}
                      </span>
                      <div className="day-servings">
                        <span>Servings</span>
                        <ServingControl
                          disabled={store.busy}
                          value={meal.servings}
                          onChange={(servings) => {
                            if (!store.busy)
                              store.setMeal(day, { ...meal, servings });
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-day">
                    <span>
                      <Plus size={25} />
                    </span>
                    <strong>Leave it open, or pick a favourite.</strong>
                    <p>There’s no need to fill every day.</p>
                  </div>
                )}
                <label className="day-select">
                  <span className="sr-only">
                    {recipe ? `Replace ${day} meal` : `Add a recipe for ${day}`}
                  </span>
                  <select
                    value={recipe?.id ?? ""}
                    disabled={store.busy}
                    onChange={(e) => {
                      if (e.target.value)
                        store.setMeal(day, {
                          recipeId: e.target.value,
                          servings: meal?.servings ?? 2,
                        });
                    }}
                  >
                    <option value="">Choose a recipe</option>
                    {store.recipes.map((r) => (
                      <option value={r.id} key={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            );
          })}
        </div>
        <div className="generate-banner">
          <span className="generate-icon">
            <Basket size={32} />
          </span>
          <div>
            <h2>Ready for the shop?</h2>
            <p>
              We’ll combine your ingredients and subtract what’s in your pantry.
            </p>
            {store.shopping && (
              <small>
                Generating again replaces manual edits and purchased checks.
              </small>
            )}
          </div>
          <button
            disabled={!count || store.busy}
            className="button primary"
            onClick={async () => {
              if (
                store.shopping &&
                !confirm(
                  "Rebuild the list? Manual edits and purchased checks will be replaced.",
                )
              )
                return;
              await store.generateList();
              router.push("/shopping-list");
            }}
          >
            <Basket size={20} />
            {store.busy ? "Working…" : "Generate shopping list"}
          </button>
        </div>
      </KitchenGate>
    </>
  );
}
