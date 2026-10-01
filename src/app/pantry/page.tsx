"use client";
import { useState } from "react";
import Link from "next/link";
import { Jar, Plus, Trash, ArrowUpRight, Plant } from "@phosphor-icons/react";
import { useStore } from "@/components/store";
import { KitchenGate } from "@/components/kitchen";
import { EditableQuantity } from "@/components/edit-quantity";
import { supportedUnits } from "@/services/grocery";
import { categoryLabels, unitLabels } from "@/lib/shopping";
import { categories } from "@/lib/recipes";

export default function PantryPage() {
  const store = useStore();
  const [ingredientId, setIngredientId] = useState(""),
    [quantity, setQuantity] = useState(1),
    [unit, setUnit] = useState("g");
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="greeting">Start with what’s already in your kitchen</p>
          <h1>What’s already at home?</h1>
          <p className="heading-description">
            Keep track of your staples. We’ll deduct them from your next
            shopping list.
          </p>
        </div>
      </div>
      <KitchenGate>
        <section className="pantry-intro">
          <Plant size={29} />
          <div>
            <strong>Your kitchen has a head start.</strong>
            <p>
              Have rice, garlic or olive oil? Add the amount you have and we’ll
              take it off your next list.
            </p>
          </div>
          <Link href="/shopping-list" className="text-link">
            Shopping list <ArrowUpRight size={17} />
          </Link>
        </section>
        <form
          className="inline-form pantry-form"
          onSubmit={async (e) => {
            e.preventDefault();
            await store.upsertPantry(ingredientId, quantity, unit);
          }}
        >
          <label>
            Ingredient
            <select
              required
              value={ingredientId}
              onChange={(e) => {
                setIngredientId(e.target.value);
                const ingredient = store.ingredients.find(
                  (i) => i.id === e.target.value,
                );
                setUnit(ingredient?.defaultUnit ?? "g");
              }}
            >
              <option value="">Choose an ingredient</option>
              {store.ingredients.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Available quantity
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
          <button
            type="submit"
            className="button primary"
            disabled={!ingredientId || store.busy}
          >
            <Plus size={18} />
            Add to pantry
          </button>
        </form>
        <p className="pantry-form-note">
          Already added this ingredient? Saving it again updates the amount.
        </p>
        {store.pantryItems.length ? (
          <div className="pantry-grid">
            {categories
              .filter((c) =>
                store.pantryItems.some((i) => i.ingredient.category === c),
              )
              .map((category) => (
                <section className="pantry-group" key={category}>
                  <h2>{categoryLabels[category]}</h2>
                  {store.pantryItems
                    .filter((i) => i.ingredient.category === category)
                    .map((item) => (
                      <div className="pantry-row" key={item.id}>
                        <span>{item.ingredient.name}</span>
                        <EditableQuantity
                          name={item.ingredient.name}
                          quantity={item.quantity}
                          unit={item.unit}
                          disabled={store.busy}
                          onSave={(quantity, unit) =>
                            store.updatePantry(item.id, quantity, unit)
                          }
                        />
                        <button
                          className="icon-button"
                          disabled={store.busy}
                          aria-label={`Delete ${item.ingredient.name} from pantry`}
                          onClick={() => store.deletePantry(item.id)}
                        >
                          <Trash size={17} />
                        </button>
                      </div>
                    ))}
                </section>
              ))}
          </div>
        ) : (
          <div className="empty-state pantry-empty">
            <Jar size={45} className="empty-icon" />
            <h2>What’s in your cupboard?</h2>
            <p>
              Rice, olive oil, salt… Add a few staples above to start your
              pantry.
            </p>
          </div>
        )}
        <div className="pantry-footnote">
          <Plant size={20} />
          Pantry amounts are deducted when you generate a list. They are not
          consumed automatically.
        </div>
      </KitchenGate>
    </>
  );
}
