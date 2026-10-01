"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Heart,
  Users,
  ArrowRight,
  MagnifyingGlass,
  SlidersHorizontal,
  Leaf,
  X,
  BookmarkSimple,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
  filters,
  searchText,
  vietnameseFirst,
  type Recipe,
} from "@/lib/recipes";
import { useStore } from "./store";

const filterLabels: Record<string, string> = {
  "All recipes": "Tất cả",
  Vietnamese: "Món Việt",
  Asian: "Món Á",
  Italian: "Món Ý",
  Healthy: "Healthy",
  "High Protein": "Giàu đạm",
  "Quick Meals": "Dưới 30 phút",
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const store = useStore();
  const saved = store.saved.includes(recipe.id);
  return (
    <article className="recipe-card">
      <div className="recipe-image-wrap">
        <Link href={`/recipes/${recipe.id}`} tabIndex={-1} aria-hidden="true">
          <img
            src={recipe.image}
            alt=""
            loading="lazy"
            className="recipe-image"
          />
        </Link>
        <span className="recipe-tag">
          {recipe.ownerId
            ? "Công thức riêng"
            : recipe.tags.includes("Vietnamese")
              ? "Món Việt"
              : recipe.tags.includes("Healthy")
                ? "Healthy"
                : recipe.category}
        </span>
        <button
          className={`save-button ${saved ? "saved" : ""}`}
          aria-label={`${saved ? "Unsave" : "Save"} ${recipe.name}`}
          aria-pressed={saved}
          onClick={() => store.saveRecipe(recipe.id)}
        >
          <Heart size={20} weight={saved ? "fill" : "regular"} />
        </button>
      </div>
      <div className="recipe-card-body">
        <Link href={`/recipes/${recipe.id}`} className="recipe-name">
          {recipe.name}
        </Link>
        <p>{recipe.subtitle}</p>
        <div className="nutrition-meta">
          <span>{recipe.difficulty === "Easy" ? "Dễ" : "Vừa"}</span>
          {recipe.calories > 0 && <span>{recipe.calories} kcal</span>}
          {recipe.protein > 0 && <span>{recipe.protein} g đạm</span>}
        </div>
        <div className="recipe-meta">
          <span>
            <Clock size={18} />
            {recipe.time} phút
          </span>
          <span>
            <Users size={18} />
            {recipe.servings} người
          </span>
          <Link
            href={`/recipes/${recipe.id}`}
            className="recipe-arrow"
            aria-label={`View ${recipe.name}`}
          >
            <ArrowRight size={19} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function RecipeBrowser({
  compact = false,
  initialSaved = false,
  initialMine = false,
  initialQuery = "",
}: {
  compact?: boolean;
  initialSaved?: boolean;
  initialMine?: boolean;
  initialQuery?: string;
}) {
  const [filter, setFilter] = useState(
    initialSaved || initialMine ? "All recipes" : "Vietnamese",
  );
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [savedOnly, setSavedOnly] = useState(initialSaved);
  const [sort, setSort] = useState("recommended");
  const [maxTime, setMaxTime] = useState(0),
    [maxCalories, setMaxCalories] = useState(0),
    [difficulty, setDifficulty] = useState(""),
    [highProtein, setHighProtein] = useState(false);
  useEffect(() => {
    setSavedOnly(initialSaved);
    setQuery(initialQuery);
    setFilter(initialSaved || initialMine ? "All recipes" : "Vietnamese");
  }, [initialSaved, initialQuery, initialMine]);
  const store = useStore();
  const showingSaved = savedOnly;
  const matches = store.recipes.filter(
    (r) =>
      (filter === "All recipes" || r.tags.includes(filter)) &&
      (!maxTime || r.time <= maxTime) &&
      (!maxCalories || (r.calories > 0 && r.calories <= maxCalories)) &&
      (!difficulty || r.difficulty === difficulty) &&
      (!highProtein || r.protein >= 30) &&
      (!initialMine || (!!store.user && r.ownerId === store.user.id)) &&
      (!showingSaved || store.saved.includes(r.id)) &&
      searchText(`${r.name} ${r.subtitle} ${r.tags.join(" ")}`).includes(
        searchText(query.trim()),
      ),
  );
  const sorted =
    sort === "time"
      ? [...matches].sort((a, b) => a.time - b.time)
      : sort === "name"
        ? [...matches].sort((a, b) => a.name.localeCompare(b.name))
        : [...matches].sort(vietnameseFirst);
  const visible = compact ? sorted.slice(0, 6) : sorted;
  return (
    <section className="recipe-section">
      {(compact || showingSaved) && (
        <div className="section-heading">
          <div>
            <h2>
              {compact
                ? "Hôm nay nấu món gì?"
                : showingSaved
                  ? "Món đã lưu"
                  : "Find your next favourite"}
            </h2>
            <p>
              {compact
                ? "Những món cơm nhà, từ bữa vội đến bữa thong thả."
                : "Simple recipes, everyday ingredients, something for everyone."}
            </p>
          </div>
          {compact && (
            <Link href="/recipes" className="text-link">
              Xem tất cả món <ArrowRight size={17} />
            </Link>
          )}
        </div>
      )}
      {compact && (
        <label className="search-field home-search">
          <MagnifyingGlass size={20} />
          <span className="sr-only">Tìm công thức</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm món: thịt kho, canh chua…"
          />
        </label>
      )}
      <div className="recipe-controls">
        <div className="filters" aria-label="Recipe categories">
          {filters.map((f) => (
            <button
              key={f}
              className={`filter-chip ${f === filter ? "selected" : ""}`}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "Healthy" && <Leaf size={15} />}
              {filterLabels[f] ?? f}
            </button>
          ))}
        </div>
        {compact ? (
          <Link
            href="/recipes"
            className="filter-icon"
            aria-label="Search and sort recipes"
          >
            <SlidersHorizontal size={20} />
          </Link>
        ) : null}
      </div>
      {!compact && (
        <div className="search-row">
          <label className="search-field">
            <MagnifyingGlass size={21} />
            <span className="sr-only">Tìm công thức</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm món: thịt kho, canh chua…"
            />
            {query && (
              <button
                aria-label="Clear search"
                className="icon-button"
                onClick={() => setQuery("")}
              >
                <X size={18} />
              </button>
            )}
          </label>
          <Link
            href={initialMine ? "/recipes" : "/recipes?mine=true"}
            className={`button secondary ${initialMine ? "selected" : ""}`}
          >
            Của tôi
          </Link>
          <button
            className={`button secondary saved-filter ${showingSaved ? "selected" : ""}`}
            onClick={() => {
              setSavedOnly(!showingSaved);
              const params = new URLSearchParams();
              if (!showingSaved) params.set("saved", "true");
              if (initialMine) params.set("mine", "true");
              if (query) params.set("q", query);
              router.replace(`/recipes${params.size ? `?${params}` : ""}`);
            }}
            aria-pressed={showingSaved}
          >
            <BookmarkSimple size={18} />
            Đã lưu
          </button>
          <label className="sort-control">
            <span className="sr-only">Sort recipes</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recommended">Món Việt trước</option>
              <option value="time">Nhanh nhất</option>
              <option value="name">Tên A–Z</option>
            </select>
          </label>
        </div>
      )}
      {!compact && (
        <details className="filter-disclosure">
          <summary>
            <SlidersHorizontal size={19} /> More filters
            {(maxTime > 0 || maxCalories > 0 || difficulty || highProtein) && (
              <span className="filter-active">Filters applied</span>
            )}
          </summary>
          <div className="advanced-filters">
            <label>
              Cooking time
              <select
                value={maxTime}
                onChange={(e) => setMaxTime(Number(e.target.value))}
              >
                <option value="0">Any time</option>
                <option value="20">Up to 20 min</option>
                <option value="30">Up to 30 min</option>
              </select>
            </label>
            <label>
              Difficulty
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="">Any difficulty</option>
                <option>Easy</option>
                <option>Medium</option>
              </select>
            </label>
            <label>
              Calories / serving
              <select
                value={maxCalories}
                onChange={(e) => setMaxCalories(Number(e.target.value))}
              >
                <option value="0">Any calories</option>
                <option value="500">Up to 500 kcal</option>
                <option value="650">Up to 650 kcal</option>
              </select>
            </label>
            <label className="protein-toggle">
              <input
                type="checkbox"
                checked={highProtein}
                onChange={(e) => setHighProtein(e.target.checked)}
              />
              High protein (30 g+)
            </label>
          </div>
        </details>
      )}
      {!compact && (
        <div className="results-count" role="status">
          {visible.length} công thức {initialMine ? "của bạn" : "để lựa chọn"}
        </div>
      )}
      {!store.ready ? (
        <div className="recipe-grid" aria-label="Loading recipes">
          {[1, 2, 3].map((i) => (
            <div className="recipe-skeleton" key={i} />
          ))}
        </div>
      ) : visible.length ? (
        <div className="recipe-grid">
          {visible.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <BookIcon />
          <h3>
            {initialMine
              ? "Bắt đầu từ món bạn hay nấu."
              : showingSaved
                ? "Giữ lại món bạn thích."
                : "Chưa tìm thấy món phù hợp."}
          </h3>
          <p>
            {initialMine
              ? "Thêm công thức riêng, hoặc chọn một món và bấm Biến tấu món này."
              : showingSaved
                ? "Tap the heart on a recipe to save it for another day."
                : "Try another search or choose a different category."}
          </p>
          {initialMine ? (
            <Link href="/recipes/new" className="button primary">
              Thêm công thức riêng
            </Link>
          ) : (
            <button
              className="button secondary"
              onClick={() => {
                setQuery("");
                setFilter("All recipes");
                setSavedOnly(false);
                setMaxTime(0);
                setMaxCalories(0);
                setDifficulty("");
                setHighProtein(false);
                if (!compact) router.replace("/recipes");
              }}
            >
              Xem tất cả món
            </button>
          )}
        </div>
      )}
      {!compact && (
        <p className="nutrition-note">
          Dinh dưỡng chỉ là ước tính mỗi khẩu phần. Món tự tạo chưa có ước tính.
        </p>
      )}
    </section>
  );
}

function BookIcon() {
  return <BookmarkSimple size={35} className="empty-icon" />;
}
