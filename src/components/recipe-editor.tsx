"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash,
  Check,
  CookingPot,
} from "@phosphor-icons/react";
import { categories, type Recipe } from "@/lib/recipes";
import { categoryLabels, unitLabels } from "@/lib/shopping";
import { supportedUnits } from "@/services/grocery";
import { api, useStore } from "./store";
import { KitchenGate } from "./kitchen";

type Row = {
  key: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
};

export function RecipeEditor({
  recipe,
  editing = false,
}: {
  recipe?: Recipe;
  editing?: boolean;
}) {
  const returnTo = editing
    ? "/recipes/" + recipe!.id + "/edit"
    : "/recipes/new" + (recipe ? "?from=" + recipe.id : "");
  return (
    <>
      <Link href="/recipes?mine=true" className="back-link">
        <ArrowLeft size={18} /> Công thức của tôi
      </Link>
      <div className="page-heading">
        <div>
          <p className="greeting">Bếp của bạn, khẩu vị của bạn</p>
          <h1>
            {editing
              ? "Chỉnh lại cho vừa ý."
              : recipe
                ? "Biến tấu theo cách của bạn."
                : "Thêm món của riêng mình."}
          </h1>
          <p className="heading-description">
            Thêm hoặc bớt nguyên liệu, chọn lượng cần dùng. Danh sách đi chợ sẽ
            theo đúng công thức bạn lưu.
          </p>
        </div>
      </div>
      <KitchenGate returnTo={returnTo}>
        <RecipeForm recipe={recipe} editing={editing} />
      </KitchenGate>
    </>
  );
}

function RecipeForm({
  recipe,
  editing,
}: {
  recipe?: Recipe;
  editing: boolean;
}) {
  const store = useStore(),
    router = useRouter();
  const [name, setName] = useState(
    recipe ? recipe.name + (editing ? "" : " — cách của tôi") : "",
  );
  const [description, setDescription] = useState(recipe?.subtitle ?? "");
  const [servings, setServings] = useState(recipe?.servings ?? 2);
  const [time, setTime] = useState(recipe?.time ?? 30);
  const [difficulty, setDifficulty] = useState(recipe?.difficulty ?? "Easy");
  const [cuisine, setCuisine] = useState(recipe?.category ?? "Vietnamese");
  const [image, setImage] = useState(
    recipe?.image === "/images/recipe-placeholder.svg"
      ? ""
      : (recipe?.image ?? ""),
  );
  const [steps, setSteps] = useState(recipe?.steps.join("\n") ?? "");
  const [rows, setRows] = useState<Row[]>(
    recipe?.ingredients.map((i, index) => ({
      key: String(index),
      name:
        store.ingredients.find((ingredient) => ingredient.id === i.ingredientId)
          ?.name ?? "",
      quantity: i.quantity,
      unit: i.unit,
      category:
        store.ingredients.find((ingredient) => ingredient.id === i.ingredientId)
          ?.category ?? "Vegetables",
    })) ?? [
      {
        key: "first",
        name: "",
        quantity: 100,
        unit: "g",
        category: "Vegetables",
      },
    ],
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [highProtein, setHighProtein] = useState(
    recipe?.tags.includes("High Protein") ?? false,
  );
  const [vegetarian, setVegetarian] = useState(
    recipe?.tags.includes("Vegetarian") ?? false,
  );
  function changeRow(key: string, changes: Partial<Row>) {
    setRows((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...changes } : row)),
    );
  }
  return (
    <form
      className="recipe-editor"
      aria-busy={busy}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const saved = await api<Recipe>(
            editing ? "recipes/" + recipe!.id : "recipes",
            editing ? "PATCH" : "POST",
            {
              name,
              description,
              servings,
              cookingTime: time,
              difficulty,
              category: cuisine,
              image,
              // Nutrition changes with substitutions. Do not carry estimates from the original recipe.
              calories: 0,
              protein: 0,
              tags: [
                cuisine,
                ...(highProtein ? ["High Protein"] : []),
                ...(vegetarian ? ["Vegetarian"] : []),
                ...(time <= 30 ? ["Quick Meals"] : []),
              ],
              steps: steps
                .split("\n")
                .map((step) => step.trim())
                .filter(Boolean),
              ingredients: rows.map((row) => {
                const ingredient = store.ingredients.find(
                  (i) =>
                    i.name.toLocaleLowerCase("vi") ===
                    row.name.trim().normalize("NFC").toLocaleLowerCase("vi"),
                );
                return {
                  ...(ingredient
                    ? { ingredientId: ingredient.id }
                    : { name: row.name, category: row.category }),
                  quantity: row.quantity,
                  unit: row.unit,
                };
              }),
            },
          );
          await store.refreshRecipes();
          store.notify(
            editing
              ? "Đã cập nhật công thức. Tạo lại danh sách đi chợ để dùng lượng mới."
              : "Đã lưu món riêng. Bạn có thể thêm món này vào kế hoạch tuần.",
          );
          router.push("/recipes/" + saved.id);
          router.refresh();
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Chưa lưu được. Vui lòng thử lại.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy} className="editor-panel">
        <legend>
          <CookingPot size={23} /> Món bạn muốn nấu
        </legend>
        <div className="editor-fields">
          <label className="field-wide">
            Tên món
            <input
              required
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Gà kho gừng ít ngọt"
            />
          </label>
          <label className="field-wide">
            Ghi chú khẩu vị <span className="optional">Không bắt buộc</span>
            <textarea
              maxLength={1000}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ít ngọt, thêm nấm, không dùng ớt…"
            />
          </label>
          <label>
            Số người ăn
            <input
              type="number"
              required
              min={1}
              max={12}
              step={1}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
            />
          </label>
          <label>
            Thời gian (phút)
            <input
              type="number"
              required
              min={1}
              max={1440}
              step={1}
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
            />
          </label>
          <label>
            Kiểu món
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
            >
              <option value="Vietnamese">Món Việt</option>
              <option value="Asian">Món Á</option>
              <option value="Italian">Món Ý</option>
              <option value="Other">Khác</option>
              <option value="Healthy">Healthy</option>
              <option value="High Protein">Giàu đạm</option>
            </select>
          </label>
          <label>
            Độ khó
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as Recipe["difficulty"])
              }
            >
              <option value="Easy">Dễ</option>
              <option value="Medium">Vừa</option>
            </select>
          </label>
        </div>
        <div className="editor-toggles">
          <label>
            <input
              type="checkbox"
              checked={vegetarian}
              onChange={(e) => setVegetarian(e.target.checked)}
            />{" "}
            Món chay
          </label>
          <label>
            <input
              type="checkbox"
              checked={highProtein}
              onChange={(e) => setHighProtein(e.target.checked)}
            />{" "}
            Giàu đạm
          </label>
        </div>
      </fieldset>
      <fieldset disabled={busy} className="editor-panel">
        <legend>Nguyên liệu đi chợ</legend>
        <p className="panel-description">
          Ghi lượng cho {servings} người ăn. Chọn nguyên liệu có sẵn hoặc gõ tên
          mới; đổi khẩu phần sau này sẽ tự tính lại lượng.
        </p>
        <datalist id="recipe-ingredients">
          {store.ingredients.map((i) => (
            <option key={i.id} value={i.name} />
          ))}
        </datalist>
        <div className="editor-ingredient-list">
          {rows.map((row, index) => (
            <div className="editor-ingredient-row" key={row.key}>
              <label>
                Nguyên liệu {index + 1}
                <input
                  required
                  maxLength={80}
                  list="recipe-ingredients"
                  value={row.name}
                  onChange={(e) => {
                    const ingredient = store.ingredients.find(
                      (i) => i.name === e.target.value,
                    );
                    changeRow(row.key, {
                      name: e.target.value,
                      ...(ingredient
                        ? {
                            category: ingredient.category,
                            unit: ingredient.defaultUnit ?? row.unit,
                          }
                        : {}),
                    });
                  }}
                  placeholder="Ví dụ: Rau muống"
                />
              </label>
              <label>
                Số lượng
                <input
                  required
                  type="number"
                  min={0.001}
                  max={100000}
                  step="any"
                  value={row.quantity}
                  onChange={(e) =>
                    changeRow(row.key, { quantity: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                Đơn vị
                <select
                  value={row.unit}
                  onChange={(e) => changeRow(row.key, { unit: e.target.value })}
                >
                  {supportedUnits.map((unit) => (
                    <option value={unit} key={unit}>
                      {unitLabels[unit] ?? unit}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nhóm đi chợ
                <select
                  disabled={store.ingredients.some(
                    (i) =>
                      i.name.toLocaleLowerCase("vi") ===
                      row.name.trim().normalize("NFC").toLocaleLowerCase("vi"),
                  )}
                  value={row.category}
                  onChange={(e) =>
                    changeRow(row.key, { category: e.target.value })
                  }
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {categoryLabels[category]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="icon-button"
                disabled={rows.length === 1}
                aria-label={"Bỏ nguyên liệu " + (index + 1)}
                onClick={() => setRows(rows.filter((i) => i.key !== row.key))}
              >
                <Trash size={20} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="button secondary"
          disabled={rows.length >= 60}
          onClick={() =>
            setRows([
              ...rows,
              {
                key: crypto.randomUUID(),
                name: "",
                quantity: 100,
                unit: "g",
                category: "Vegetables",
              },
            ])
          }
        >
          <Plus size={19} /> Thêm nguyên liệu
        </button>
      </fieldset>
      <fieldset disabled={busy} className="editor-panel">
        <legend>
          Cách nấu & ảnh <span className="optional">Không bắt buộc</span>
        </legend>
        <label>
          Cách nấu
          <textarea
            rows={5}
            maxLength={30000}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="Mỗi bước một dòng. Bạn cũng có thể chỉ lưu nguyên liệu để lên danh sách đi chợ."
          />
        </label>
        <label>
          Đường dẫn ảnh
          <input
            type="text"
            maxLength={2000}
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://… (để trống nếu chưa có ảnh)"
          />
        </label>
        {editing && (
          <p className="editor-help">
            Công thức mới sẽ áp dụng cho các bữa đã lên lịch. Danh sách đi chợ
            đã tạo giữ nguyên đến khi bạn tạo lại.
          </p>
        )}
        <p className="editor-help">
          Chỉ tài khoản của bạn xem được công thức này. Nguyên liệu mới được
          thêm vào danh mục để dễ dùng lại. Dinh dưỡng chưa được tính cho món tự
          tạo.
        </p>
      </fieldset>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <div className="editor-actions">
        <Link
          href={
            recipe && editing ? "/recipes/" + recipe.id : "/recipes?mine=true"
          }
          className="button secondary"
        >
          Quay lại
        </Link>
        <button disabled={busy} className="button primary" type="submit">
          <Check size={20} />{" "}
          {busy
            ? "Đang lưu…"
            : editing
              ? "Lưu thay đổi"
              : "Lưu công thức riêng"}
        </button>
      </div>
    </form>
  );
}
