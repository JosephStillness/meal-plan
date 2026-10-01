"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Basket,
  Plus,
  Trash,
  Check,
  ArrowRight,
  DownloadSimple,
  ArrowsClockwise,
  Jar,
} from "@phosphor-icons/react";
import { useStore } from "@/components/store";
import { KitchenGate, WeekControl } from "@/components/kitchen";
import { EditableQuantity } from "@/components/edit-quantity";
import { categories } from "@/lib/recipes";
import { groupGroceries, supportedUnits } from "@/services/grocery";
import { categoryLabels, unitLabels, formatQuantity } from "@/lib/shopping";

export default function ShoppingPage() {
  const store = useStore();
  const [adding, setAdding] = useState(false),
    [name, setName] = useState(""),
    [quantity, setQuantity] = useState(1),
    [unit, setUnit] = useState("whole"),
    [category, setCategory] = useState("Pantry");
  const items = store.shopping?.items ?? [],
    groups = groupGroceries(items),
    purchased = items.filter((i) => i.isPurchased).length;
  function exportList() {
    const content =
      `MealMate shopping list — week of ${store.week}\n\n` +
      categories
        .filter((c) => groups[c]?.length)
        .map(
          (c) =>
            `${categoryLabels[c]}\n${groups[c].map((i) => `${i.isPurchased ? "[x]" : "[ ]"} ${i.ingredient.name} — ${formatQuantity(i.quantity, i.unit)}`).join("\n")}`,
        )
        .join("\n\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `mealmate-${store.week}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="greeting">Everything in one place</p>
          <h1>Your shopping list.</h1>
          <p className="heading-description">
            Everything you need, without the things you already have.
          </p>
        </div>
        <WeekControl />
      </div>
      <KitchenGate>
        <div className="shopping-toolbar">
          <div className="shopping-stat">
            <span className="week-banner-icon">
              <Basket size={25} />
            </span>
            <div>
              <strong>
                {items.length && purchased === items.length
                  ? "All picked up. You’re ready to cook!"
                  : items.length - purchased + " left to pick up"}
              </strong>
              <span>
                {purchased} of {items.length} checked off ·{" "}
                {Object.keys(store.plan).length} meals planned
              </span>
            </div>
          </div>
          <div className="button-row">
            {items.length > 0 && (
              <button className="button secondary" onClick={exportList}>
                <DownloadSimple size={18} />
                Export
              </button>
            )}
            <button
              disabled={store.busy}
              className="button primary"
              onClick={() => setAdding(!adding)}
            >
              <Plus size={18} />
              Add item
            </button>
          </div>
        </div>
        {adding && (
          <form
            className="inline-form add-item-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const existing = store.ingredients.find(
                (i) => i.name.toLowerCase() === name.trim().toLowerCase(),
              );
              await store.addListItem({
                ...(existing
                  ? { ingredientId: existing.id }
                  : { name: name.trim(), category }),
                quantity,
                unit,
              });
              setAdding(false);
              setName("");
            }}
          >
            <label>
              Ingredient
              <input
                required
                maxLength={80}
                list="ingredient-suggestions"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apples"
              />
              <datalist id="ingredient-suggestions">
                {store.ingredients.map((i) => (
                  <option key={i.id} value={i.name} />
                ))}
              </datalist>
            </label>
            <label>
              Quantity
              <input
                required
                type="number"
                min="0.001"
                max="100000"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>
            <label>
              Unit
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                {supportedUnits.map((u) => (
                  <option key={u} value={u}>
                    {unitLabels[u] ?? u}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabels[c]}
                  </option>
                ))}
              </select>
            </label>
            <button
              disabled={store.busy}
              className="button primary"
              type="submit"
            >
              Save item
            </button>
          </form>
        )}
        {items.length > 0 ? (
          <>
            <div
              className="shopping-progress"
              role="progressbar"
              aria-label="Shopping progress"
              aria-valuemin={0}
              aria-valuemax={items.length}
              aria-valuenow={purchased}
            >
              <span style={{ width: `${(purchased / items.length) * 100}%` }} />
            </div>
            <div className="shopping-layout">
              <div className="shopping-groups">
                {categories
                  .filter((c) => groups[c]?.length)
                  .map((c) => (
                    <section className="shopping-group" key={c}>
                      <div className="group-heading">
                        <h2>{categoryLabels[c]}</h2>
                        <span>
                          {groups[c].length}{" "}
                          {groups[c].length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      {groups[c].map((item) => (
                        <div
                          className={`shopping-row ${item.isPurchased ? "purchased" : ""}`}
                          key={item.id}
                        >
                          <label className="shopping-check">
                            <input
                              disabled={store.busy}
                              type="checkbox"
                              checked={item.isPurchased}
                              onChange={() =>
                                store.updateListItem(item.id, {
                                  isPurchased: !item.isPurchased,
                                })
                              }
                            />
                            <span className="custom-check">
                              {item.isPurchased && (
                                <Check size={14} weight="bold" />
                              )}
                            </span>
                            <span>{item.ingredient.name}</span>
                          </label>
                          <EditableQuantity
                            quantity={item.quantity}
                            unit={item.unit}
                            name={item.ingredient.name}
                            disabled={store.busy}
                            onSave={(quantity, unit) =>
                              store.updateListItem(item.id, { quantity, unit })
                            }
                          />
                          <button
                            className="icon-button remove-item"
                            disabled={store.busy}
                            aria-label={`Remove ${item.ingredient.name}`}
                            onClick={() => store.deleteListItem(item.id)}
                          >
                            <Trash size={17} />
                          </button>
                        </div>
                      ))}
                    </section>
                  ))}
              </div>
              <aside className="shopping-aside">
                <Jar size={31} />
                <h3>Check your cupboard first.</h3>
                <p>
                  {store.pantryItems.length
                    ? `${store.pantryItems.length} pantry ${store.pantryItems.length === 1 ? "entry" : "entries"} saved. Matching amounts are deducted whenever you generate a list.`
                    : "Add your staples to your pantry, then regenerate to deduct them."}
                </p>
                <Link href="/pantry" className="text-link">
                  Manage pantry <ArrowRight size={17} />
                </Link>
                <div className="aside-divider" />
                <p>
                  Changed your meals or pantry? Refresh to rebuild the list.
                </p>
                <button
                  disabled={store.busy}
                  className="button secondary full-width"
                  onClick={() => {
                    if (
                      confirm(
                        "Rebuild the list? Manual edits and purchased checks will be replaced.",
                      )
                    )
                      store.generateList();
                  }}
                >
                  <ArrowsClockwise size={18} />
                  Regenerate list
                </button>
                <small>Regeneration replaces manual changes.</small>
              </aside>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Basket size={43} className="empty-icon" />
            <h2>
              {store.shopping
                ? "Your list is all clear."
                : "Good meals start with a good list."}
            </h2>
            <p>
              {store.shopping
                ? "Your pantry covers your meals, or your list is empty. Add an item or update your plan."
                : "Plan your meals, then generate a list with the ingredients combined for you."}
            </p>
            <div className="button-row">
              {Object.keys(store.plan).length > 0 && (
                <button
                  className="button primary"
                  disabled={store.busy}
                  onClick={store.generateList}
                >
                  Generate shopping list <ArrowRight size={17} />
                </button>
              )}
              <Link href="/meal-plan" className="button secondary">
                Go to meal planner <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        )}
      </KitchenGate>
    </>
  );
}
