"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarPlus,
  Clock,
  Heart,
  Minus,
  Plus,
  Users,
  Check,
} from "@phosphor-icons/react";
import { days, type Recipe } from "@/lib/recipes";
import { normalize } from "@/services/grocery";
import { formatQuantity } from "@/lib/shopping";
import { useStore } from "./store";

export function ServingControl({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="serving-control">
      <button
        aria-label="Fewer servings"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <Minus size={15} />
      </button>
      <span>{value}</span>
      <button
        aria-label="More servings"
        disabled={disabled || value >= 12}
        onClick={() => onChange(Math.min(12, value + 1))}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const [servings, setServings] = useState(recipe.servings);
  const [day, setDay] = useState(days[0]);
  const store = useStore();
  const ingredients = store.ingredients;
  const saved = store.saved.includes(recipe.id);
  return (
    <>
      <Link href="/recipes" className="back-link">
        <ArrowLeft size={18} />
        Xem các món
      </Link>
      <div className="detail-top">
        <div className="detail-photo">
          <img src={recipe.image} alt={recipe.name} />
          <span className="detail-photo-label">Nấu theo khẩu vị nhà mình</span>
        </div>
        <div className="detail-intro">
          <div className="detail-tags">
            {recipe.tags.map((tag) => (
              <span key={tag}>{tag === "Vietnamese" ? "Món Việt" : tag}</span>
            ))}
          </div>
          <h1>{recipe.name}</h1>
          <p className="detail-description">{recipe.subtitle}</p>
          <div className="detail-meta">
            <span>
              <Clock size={21} />
              {recipe.time} phút
            </span>
            <span>
              <Users size={22} />
              {servings} người
            </span>
          </div>
          {recipe.calories > 0 && (
            <div className="nutrition-facts">
              <div>
                <strong>{recipe.calories}</strong>
                <span>kcal / serving</span>
              </div>
              <div>
                <strong>{recipe.protein} g</strong>
                <span>protein / serving</span>
              </div>
              <div>
                <strong>{recipe.difficulty === "Easy" ? "Dễ" : "Vừa"}</strong>
                <span>difficulty</span>
              </div>
            </div>
          )}
          <div className="detail-servings">
            <div>
              <strong>Bạn nấu cho mấy người?</strong>
              <p>Lượng nguyên liệu sẽ tự điều chỉnh.</p>
            </div>
            <ServingControl value={servings} onChange={setServings} />
          </div>
          <div className="add-to-plan">
            <label htmlFor="recipe-day">Chọn ngày nấu</label>
            <div>
              <select
                id="recipe-day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                    {store.plan[d] ? " · thay món đã chọn" : ""}
                  </option>
                ))}
              </select>
              <button
                disabled={store.busy}
                className="button primary"
                onClick={() =>
                  store.setMeal(day, { recipeId: recipe.id, servings })
                }
              >
                <CalendarPlus size={18} />
                {store.busy ? "Đang lưu…" : "Thêm vào kế hoạch"}
              </button>
            </div>
          </div>
          <button
            className={`button secondary full-width ${saved ? "selected" : ""}`}
            aria-pressed={saved}
            onClick={() => store.saveRecipe(recipe.id)}
          >
            <Heart size={19} weight={saved ? "fill" : "regular"} />
            {saved ? "Đã lưu món này" : "Lưu món để xem lại"}
          </button>
          <div className="button-row recipe-personal-actions">
            <Link
              href={`/recipes/new?from=${recipe.id}`}
              className="button secondary"
            >
              Biến tấu món này
            </Link>
            {store.user?.id === recipe.ownerId && (
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className="button primary"
              >
                Sửa công thức
              </Link>
            )}
          </div>
          <p className="nutrition-note">
            {recipe.calories > 0
              ? "Dinh dưỡng là ước tính mỗi khẩu phần."
              : "Chưa có ước tính dinh dưỡng cho món này."}
          </p>
        </div>
      </div>
      <div className="detail-bottom">
        <section className="ingredient-panel">
          <div className="section-heading">
            <h2>Nguyên liệu cần chuẩn bị</h2>
            <span>{servings} người</span>
          </div>
          <p className="panel-description">
            Tick nếu nhà đã có đủ lượng này. Bạn có thể sửa lượng có sẵn trong
            mục My pantry.
          </p>
          <div className="ingredient-list">
            {recipe.ingredients.map((entry) => {
              const ingredient = ingredients.find(
                (i) => i.id === entry.ingredientId,
              );
              const required = normalize({
                ...entry,
                quantity: (entry.quantity * servings) / recipe.servings,
              });
              const available = store.pantryItems
                .filter((i) => i.ingredientId === entry.ingredientId)
                .map(normalize)
                .filter((i) => i.unit === required.unit)
                .reduce((sum, i) => sum + i.quantity, 0);
              const have = available >= required.quantity;
              return (
                <label
                  key={`${entry.ingredientId}:${entry.unit}`}
                  className={`ingredient-row ${have ? "already-have" : ""}`}
                >
                  <input
                    disabled={store.busy}
                    type="checkbox"
                    checked={have}
                    onChange={() =>
                      have
                        ? store.setPantry(entry.ingredientId)
                        : store.upsertPantry(
                            entry.ingredientId,
                            (entry.quantity * servings) / recipe.servings,
                            entry.unit,
                          )
                    }
                  />
                  <span className="custom-check">
                    {have && <Check size={13} weight="bold" />}
                  </span>
                  <span>
                    {ingredient?.name ?? entry.ingredientId}
                    {available > 0 && (
                      <small>
                        Pantry: {formatQuantity(available, required.unit)}
                      </small>
                    )}
                  </span>
                  <strong>
                    {formatQuantity(
                      (entry.quantity * servings) / recipe.servings,
                      entry.unit,
                    )}
                  </strong>
                </label>
              );
            })}
          </div>
        </section>
        <section className="method-panel">
          <h2>Cách nấu</h2>
          <div className="method-steps">
            {!recipe.steps.length && (
              <p className="panel-description">
                Bạn chưa ghi cách nấu. Nguyên liệu vẫn dùng được để tính đồ cần
                mua.
              </p>
            )}
            {recipe.steps.map((step, index) => (
              <div className="method-step" key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
          <div className="cooking-note">
            Nêm nếm theo khẩu vị của bạn. Muốn đổi nguyên liệu hoặc lượng dùng?
            Bấm Biến tấu món này để lưu bản riêng.
          </div>
        </section>
      </div>
    </>
  );
}
