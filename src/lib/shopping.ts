export const unitLabels: Record<string, string> = {
  g: "g",
  kg: "kg",
  ml: "ml",
  l: "lít",
  tsp: "muỗng cà phê",
  tbsp: "muỗng canh",
  whole: "cái / quả",
  cloves: "tép",
  bunch: "bó",
  packet: "gói",
  pieces: "miếng",
};
export const categoryLabels: Record<string, string> = {
  "Meat & Seafood": "Thịt & hải sản",
  Vegetables: "Rau củ",
  Fruit: "Trái cây",
  Dairy: "Trứng & sữa",
  Grains: "Gạo, bún & mì",
  Pantry: "Đồ khô & gia vị",
  Spices: "Gia vị",
};
export type Meal = { recipeId: string; servings: number };

export function formatQuantity(quantity: number, unit: string) {
  if (unit === "g" && quantity >= 1000)
    return `${Number((quantity / 1000).toFixed(2))} kg`;
  if (unit === "ml" && quantity >= 1000)
    return `${Number((quantity / 1000).toFixed(2))} L`;
  const amount = Number(quantity.toFixed(2));
  return unit === "whole"
    ? `${amount}`
    : `${amount} ${unitLabels[unit] ?? unit}`;
}
