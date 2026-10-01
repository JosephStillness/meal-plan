export type Category =
  | "Meat & Seafood"
  | "Vegetables"
  | "Fruit"
  | "Dairy"
  | "Grains"
  | "Pantry"
  | "Spices";
export type Ingredient = {
  id: string;
  name: string;
  category: Category;
  defaultUnit?: string;
};
export type RecipeIngredient = {
  ingredientId: string;
  quantity: number;
  unit: string;
};
export type Recipe = {
  ownerId?: string | null;
  id: string;
  name: string;
  subtitle: string;
  image: string;
  time: number;
  difficulty: "Easy" | "Medium";
  calories: number;
  protein: number;
  category: string;
  tags: string[];
  servings: number;
  ingredients: RecipeIngredient[];
  steps: string[];
};

export const ingredients: Ingredient[] = [
  { id: "beef", name: "Thịt bò", category: "Meat & Seafood" },
  { id: "chicken", name: "Ức gà", category: "Meat & Seafood" },
  { id: "salmon", name: "Salmon fillet", category: "Meat & Seafood" },
  { id: "shrimp", name: "Tôm", category: "Meat & Seafood" },
  { id: "onion", name: "Hành tây", category: "Vegetables" },
  { id: "garlic", name: "Tỏi", category: "Vegetables" },
  { id: "broccoli", name: "Broccoli", category: "Vegetables" },
  { id: "tomato", name: "Cherry tomatoes", category: "Vegetables" },
  { id: "spinach", name: "Baby spinach", category: "Vegetables" },
  { id: "basil", name: "Fresh basil", category: "Vegetables" },
  { id: "lemon", name: "Lemon", category: "Fruit" },
  { id: "ginger", name: "Gừng", category: "Vegetables" },
  { id: "carrot", name: "Cà rốt", category: "Vegetables" },
  { id: "cucumber", name: "Dưa leo", category: "Vegetables" },
  { id: "pepper-veg", name: "Ớt chuông", category: "Vegetables" },
  { id: "mushroom", name: "Nấm", category: "Vegetables" },
  { id: "herbs", name: "Rau mùi", category: "Vegetables" },
  { id: "pasta", name: "Pasta", category: "Grains" },
  { id: "rice", name: "Gạo", category: "Grains" },
  { id: "rice-noodles", name: "Bánh phở khô", category: "Grains" },
  { id: "quinoa", name: "Quinoa", category: "Grains" },
  { id: "parmesan", name: "Parmesan", category: "Dairy" },
  { id: "egg", name: "Trứng", category: "Dairy" },
  { id: "yogurt", name: "Greek yogurt", category: "Dairy" },
  { id: "tomato-sauce", name: "Tomato sauce", category: "Pantry" },
  { id: "olive-oil", name: "Dầu ô liu", category: "Pantry" },
  { id: "salt", name: "Muối", category: "Spices" },
  { id: "pepper", name: "Tiêu đen", category: "Spices" },
  { id: "soy-sauce", name: "Nước tương", category: "Pantry" },
  { id: "fish-sauce", name: "Nước mắm", category: "Pantry" },
  { id: "stock", name: "Nước dùng gà", category: "Pantry" },
  { id: "beef-stock", name: "Nước dùng bò", category: "Pantry" },
  { id: "pesto", name: "Basil pesto", category: "Pantry" },
  { id: "chickpeas", name: "Chickpeas, drained", category: "Pantry" },
  { id: "honey", name: "Honey", category: "Pantry" },
  { id: "tuna", name: "Canned tuna, drained", category: "Meat & Seafood" },
  { id: "butter", name: "Butter", category: "Dairy" },
  { id: "coconut-milk", name: "Coconut milk", category: "Pantry" },
  { id: "curry-powder", name: "Curry powder", category: "Spices" },
  { id: "black-beans", name: "Black beans, drained", category: "Pantry" },
  { id: "corn", name: "Corn kernels", category: "Vegetables" },
  { id: "avocado", name: "Avocado", category: "Fruit" },
  { id: "lime", name: "Chanh", category: "Fruit" },
  { id: "star-anise", name: "Hoa hồi", category: "Spices" },
  { id: "pork-belly", name: "Thịt ba chỉ", category: "Meat & Seafood" },

  { id: "pork-mince", name: "Thịt heo xay", category: "Meat & Seafood" },

  { id: "white-fish", name: "Cá trắng phi lê", category: "Meat & Seafood" },

  { id: "tofu", name: "Đậu hũ", category: "Vegetables" },

  { id: "water-spinach", name: "Rau muống", category: "Vegetables" },

  { id: "mustard-greens", name: "Cải xanh", category: "Vegetables" },

  { id: "scallion", name: "Hành lá", category: "Vegetables" },

  { id: "shallot", name: "Hành tím", category: "Vegetables" },

  { id: "tomato-viet", name: "Cà chua", category: "Vegetables" },

  { id: "pineapple", name: "Dứa", category: "Fruit" },

  { id: "bean-sprouts", name: "Giá đỗ", category: "Vegetables" },

  { id: "okra", name: "Đậu bắp", category: "Vegetables" },

  { id: "tamarind", name: "Me chua", category: "Pantry" },

  { id: "coconut-water", name: "Nước dừa", category: "Pantry" },

  { id: "sugar", name: "Đường", category: "Spices" },

  { id: "cooking-oil", name: "Dầu ăn", category: "Pantry" },

  { id: "chili", name: "Ớt", category: "Vegetables" },

  { id: "rice-vermicelli", name: "Bún khô", category: "Grains" },

  { id: "lemongrass", name: "Sả", category: "Vegetables" },
];

const i = (
  ingredientId: string,
  quantity: number,
  unit: string,
): RecipeIngredient => ({ ingredientId, quantity, unit });

// Demo recipes use two servings; quantities are scaled before building the shopping list.
const baseRecipes: Omit<
  Recipe,
  "difficulty" | "calories" | "protein" | "category" | "image"
>[] = [
  {
    id: "pesto-pasta",
    name: "Green pesto pasta",
    subtitle: "A little green, a lot of goodness.",
    time: 20,
    tags: ["Italian", "Vegetarian", "Quick Meals"],
    servings: 2,
    ingredients: [
      i("pasta", 200, "g"),
      i("pesto", 60, "g"),
      i("tomato", 150, "g"),
      i("basil", 10, "g"),
      i("parmesan", 30, "g"),
      i("garlic", 2, "cloves"),
      i("olive-oil", 15, "ml"),
      i("salt", 0.5, "tsp"),
      i("pepper", 0.25, "tsp"),
    ],
    steps: [
      "Bring a large pot of salted water to a boil. Cook the pasta according to the packet, reserving a cup of pasta water.",
      "Halve the tomatoes and finely chop the garlic. Warm the olive oil in a pan; soften the garlic for a minute, then add the tomatoes.",
      "Remove the pan from the heat. Toss in the pasta and pesto, adding a little pasta water until glossy.",
      "Finish with parmesan, fresh basil and black pepper. Serve straight away.",
    ],
  },
  {
    id: "chicken-rice",
    name: "Cơm gà",
    subtitle: "Cơm thơm gừng, gà mềm và dưa leo giòn.",
    time: 35,
    tags: ["Vietnamese", "High Protein"],
    servings: 2,
    ingredients: [
      i("chicken", 350, "g"),
      i("rice", 200, "g"),
      i("garlic", 3, "cloves"),
      i("ginger", 20, "g"),
      i("cucumber", 1, "whole"),
      i("stock", 400, "ml"),
      i("fish-sauce", 15, "ml"),
      i("herbs", 15, "g"),
      i("salt", 0.5, "tsp"),
    ],
    steps: [
      "Vo gạo. Băm tỏi, gừng và thái dưa leo.",
      "Cho gạo, tỏi, gừng và nước dùng vào nồi. Đun sôi, đậy nắp và nấu lửa nhỏ đến khi cơm chín.",
      "Luộc gà riêng với lửa nhỏ đến khi phần dày nhất đạt 75°C. Để nghỉ rồi thái miếng.",
      "Dùng gà với cơm, dưa leo, rau mùi và nước mắm.",
    ],
  },
  {
    id: "salmon-bowl",
    name: "Salmon rice bowl",
    subtitle: "Fresh, colourful and feel-good.",
    time: 25,
    tags: ["Healthy", "High Protein", "Quick Meals"],
    servings: 2,
    ingredients: [
      i("salmon", 300, "g"),
      i("rice", 150, "g"),
      i("broccoli", 250, "g"),
      i("spinach", 60, "g"),
      i("lemon", 1, "whole"),
      i("garlic", 2, "cloves"),
      i("olive-oil", 20, "ml"),
      i("salt", 0.5, "tsp"),
      i("pepper", 0.25, "tsp"),
    ],
    steps: [
      "Heat the oven to 200°C. Rinse and cook rice according to the packet.",
      "Place salmon and broccoli on a lined tray. Drizzle with oil, add chopped garlic, salt and pepper, and squeeze over half the lemon.",
      "Bake for 12–15 minutes, until the salmon is cooked through and flakes easily.",
      "Divide rice and spinach between bowls. Top with salmon, broccoli and the remaining lemon.",
    ],
  },
  {
    id: "beef-pasta",
    name: "Classic beef pasta",
    subtitle: "Rich tomato sauce. Empty plates.",
    time: 30,
    tags: ["Italian", "High Protein"],
    servings: 2,
    ingredients: [
      i("beef", 300, "g"),
      i("pasta", 200, "g"),
      i("onion", 1, "whole"),
      i("garlic", 3, "cloves"),
      i("tomato-sauce", 200, "ml"),
      i("parmesan", 30, "g"),
      i("olive-oil", 15, "ml"),
      i("salt", 0.5, "tsp"),
      i("pepper", 0.25, "tsp"),
    ],
    steps: [
      "Cook the pasta in salted boiling water according to the packet.",
      "Dice the onion and garlic. Heat oil in a pan and soften the onion, then add garlic.",
      "Add finely chopped or minced beef and brown thoroughly. Stir in tomato sauce, salt and pepper; simmer for 10 minutes.",
      "Toss the drained pasta through the sauce and finish with grated parmesan.",
    ],
  },
  {
    id: "shaking-beef",
    name: "Bò lúc lắc",
    subtitle: "Bò xào mềm, rau củ giòn, dùng với cơm nóng.",
    time: 25,
    tags: ["Vietnamese", "High Protein", "Quick Meals"],
    servings: 2,
    ingredients: [
      i("beef", 350, "g"),
      i("rice", 180, "g"),
      i("onion", 1, "whole"),
      i("pepper-veg", 1, "whole"),
      i("garlic", 3, "cloves"),
      i("soy-sauce", 30, "ml"),
      i("olive-oil", 15, "ml"),
      i("pepper", 0.5, "tsp"),
    ],
    steps: [
      "Nấu cơm. Cắt bò thành khối vừa ăn, ướp với nước tương, tỏi băm và tiêu.",
      "Cắt hành tây và ớt chuông. Xào rau củ với một nửa dầu đến khi vừa chín rồi lấy ra.",
      "Đun nóng dầu còn lại. Xào bò từng mẻ, lắc chảo để thịt vàng đều và chín theo ý bạn.",
      "Cho rau củ trở lại chảo, đảo đều rồi dùng với cơm.",
    ],
  },
  {
    id: "chickpea-salad",
    name: "Mediterranean crunch",
    subtitle: "A bright bowl for a lighter day.",
    time: 15,
    tags: ["Healthy", "Vegetarian", "Quick Meals"],
    servings: 2,
    ingredients: [
      i("chickpeas", 400, "g"),
      i("cucumber", 1, "whole"),
      i("tomato", 200, "g"),
      i("spinach", 80, "g"),
      i("lemon", 1, "whole"),
      i("yogurt", 100, "g"),
      i("olive-oil", 15, "ml"),
      i("salt", 0.5, "tsp"),
      i("pepper", 0.25, "tsp"),
    ],
    steps: [
      "Rinse and drain the chickpeas. Chop the cucumber and halve the tomatoes.",
      "Whisk yogurt, lemon juice, olive oil, salt and pepper together.",
      "Toss the chickpeas and vegetables with the spinach, then spoon over the dressing.",
    ],
  },
  {
    id: "pho-beef",
    name: "Phở bò",
    subtitle: "Phiên bản nhanh với nước dùng có sẵn, dễ nấu tại nhà.",
    time: 40,
    tags: ["Vietnamese", "High Protein"],
    servings: 2,
    ingredients: [
      i("beef", 250, "g"),
      i("rice-noodles", 200, "g"),
      i("onion", 1, "whole"),
      i("ginger", 25, "g"),
      i("beef-stock", 1000, "ml"),
      i("fish-sauce", 20, "ml"),
      i("star-anise", 2, "whole"),
      i("herbs", 20, "g"),
      i("lemon", 1, "whole"),
    ],
    steps: [
      "Áp chảo hành tây bổ đôi và gừng thái lát cho thơm.",
      "Đun nước dùng với hành, gừng và hoa hồi trong 25 phút. Nêm nước mắm rồi lọc nước dùng.",
      "Luộc bánh phở theo hướng dẫn trên gói. Thái bò mỏng, nấu trong nước dùng đến khi chín.",
      "Cho bánh phở vào tô, thêm bò và nước dùng nóng. Dùng với rau mùi và chanh.",
    ],
  },
  {
    id: "garlic-prawns",
    name: "Garlic prawn pasta",
    subtitle: "Simple ingredients, lovely dinner.",
    time: 20,
    tags: ["Italian", "Quick Meals"],
    servings: 2,
    ingredients: [
      i("shrimp", 300, "g"),
      i("pasta", 200, "g"),
      i("garlic", 4, "cloves"),
      i("lemon", 1, "whole"),
      i("olive-oil", 25, "ml"),
      i("basil", 10, "g"),
      i("salt", 0.5, "tsp"),
      i("pepper", 0.25, "tsp"),
    ],
    steps: [
      "Cook pasta according to the packet, reserving a little pasta water.",
      "Heat olive oil and gently cook sliced garlic for a minute. Add peeled prawns and cook until opaque and cooked through.",
      "Toss in pasta, lemon juice and a splash of pasta water. Season and finish with fresh basil.",
    ],
  },
  {
    id: "egg-fried-rice",
    name: "Cơm chiên trứng",
    subtitle: "Cơm chiên vàng với trứng và rau củ, gọn một chảo.",
    time: 15,
    tags: ["Vietnamese", "Vegetarian", "Quick Meals"],
    servings: 2,
    ingredients: [
      i("rice", 200, "g"),
      i("egg", 3, "whole"),
      i("carrot", 1, "whole"),
      i("onion", 0.5, "whole"),
      i("garlic", 2, "cloves"),
      i("soy-sauce", 25, "ml"),
      i("olive-oil", 20, "ml"),
      i("pepper", 0.25, "tsp"),
    ],
    steps: [
      "Nấu cơm từ lượng gạo khô trong công thức, làm nguội nhanh. Cắt cà rốt, hành tây và tỏi.",
      "Đun nóng dầu, xào rau củ đến khi chín rồi gạt sang một bên.",
      "Cho trứng đã đánh vào, đảo đến khi chín. Thêm cơm, nước tương và tiêu, đảo đến khi nóng đều. Dùng ngay.",
    ],
  },
];

export const filters = [
  "All recipes",
  "Vietnamese",
  "Asian",
  "Italian",
  "Healthy",
  "High Protein",
  "Quick Meals",
];
export const categories: Category[] = [
  "Meat & Seafood",
  "Vegetables",
  "Fruit",
  "Dairy",
  "Grains",
  "Pantry",
  "Spices",
];
export const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

baseRecipes.push(
  {
    id: "teriyaki-chicken",
    name: "Chicken teriyaki rice",
    subtitle: "Sticky, savoury and weeknight-friendly.",
    time: 25,
    tags: ["Asian", "High Protein", "Quick Meals"],
    servings: 2,
    ingredients: [
      i("chicken", 350, "g"),
      i("rice", 180, "g"),
      i("broccoli", 200, "g"),
      i("garlic", 2, "cloves"),
      i("ginger", 15, "g"),
      i("soy-sauce", 30, "ml"),
      i("honey", 20, "g"),
      i("olive-oil", 15, "ml"),
    ],
    steps: [
      "Cook rice according to the packet. Steam broccoli until tender.",
      "Cut chicken into strips. Heat oil and cook the chicken with chopped garlic and ginger until the chicken reaches 75°C.",
      "Stir in soy sauce, honey and a splash of water. Simmer until glossy and serve with rice and broccoli.",
    ],
  },
  {
    id: "chicken-fried-rice",
    name: "Chicken fried rice",
    subtitle: "A satisfying one-pan favourite.",
    time: 25,
    tags: ["Asian", "High Protein", "Quick Meals"],
    servings: 2,
    ingredients: [
      i("chicken", 250, "g"),
      i("rice", 180, "g"),
      i("egg", 2, "whole"),
      i("carrot", 1, "whole"),
      i("onion", 0.5, "whole"),
      i("garlic", 2, "cloves"),
      i("soy-sauce", 25, "ml"),
      i("olive-oil", 20, "ml"),
    ],
    steps: [
      "Cook the rice from the dry quantity listed, and cool it promptly. Dice the vegetables and chicken.",
      "Stir-fry chicken in hot oil until it reaches 75°C. Add vegetables and cook until tender.",
      "Push everything aside and scramble the eggs until set. Stir in rice and soy sauce. Cook until steaming hot and serve immediately.",
    ],
  },
  {
    id: "chicken-curry",
    name: "Chicken curry",
    subtitle: "A cosy bowl with a gentle kick.",
    time: 35,
    tags: ["Asian", "High Protein"],
    servings: 2,
    ingredients: [
      i("chicken", 350, "g"),
      i("rice", 180, "g"),
      i("onion", 1, "whole"),
      i("garlic", 3, "cloves"),
      i("ginger", 15, "g"),
      i("curry-powder", 2, "tsp"),
      i("coconut-milk", 250, "ml"),
      i("spinach", 80, "g"),
      i("olive-oil", 15, "ml"),
      i("salt", 0.5, "tsp"),
    ],
    steps: [
      "Cook the rice. Soften diced onion in oil, then stir in chopped garlic, ginger and curry powder.",
      "Add diced chicken, coconut milk and a splash of water. Simmer for 15–20 minutes until chicken reaches 75°C.",
      "Stir in spinach until wilted. Season with salt and serve with rice.",
    ],
  },
  {
    id: "steak-vegetables",
    name: "Steak and vegetables",
    subtitle: "A classic dinner, simply done.",
    time: 30,
    tags: ["Healthy", "High Protein"],
    servings: 2,
    ingredients: [
      i("beef", 400, "g"),
      i("broccoli", 250, "g"),
      i("carrot", 2, "whole"),
      i("garlic", 2, "cloves"),
      i("butter", 20, "g"),
      i("olive-oil", 15, "ml"),
      i("salt", 0.5, "tsp"),
      i("pepper", 0.5, "tsp"),
    ],
    steps: [
      "Season steaks and let them come toward room temperature. Steam broccoli and sliced carrots until tender.",
      "Heat oil in a heavy pan. Sear steaks on both sides until cooked to your preference. Add butter and garlic near the end and baste.",
      "Rest the steak for 5 minutes, then slice and serve alongside the vegetables.",
    ],
  },
  {
    id: "garlic-butter-chicken",
    name: "Garlic butter chicken",
    subtitle: "Golden chicken, plenty of garlic.",
    time: 25,
    tags: ["High Protein", "Quick Meals"],
    servings: 2,
    ingredients: [
      i("chicken", 350, "g"),
      i("rice", 180, "g"),
      i("garlic", 4, "cloves"),
      i("butter", 25, "g"),
      i("lemon", 1, "whole"),
      i("broccoli", 200, "g"),
      i("olive-oil", 10, "ml"),
      i("salt", 0.5, "tsp"),
      i("pepper", 0.25, "tsp"),
    ],
    steps: [
      "Cook rice and steam broccoli. Season the chicken with salt and pepper.",
      "Heat oil and pan-fry chicken until cooked through to 75°C. Add butter and chopped garlic during the final minute.",
      "Squeeze over lemon juice and serve with the rice, broccoli and pan juices.",
    ],
  },
  {
    id: "tuna-pasta",
    name: "Tuna pasta",
    subtitle: "A pantry staple with a fresh twist.",
    time: 20,
    tags: ["Italian", "High Protein", "Quick Meals"],
    servings: 2,
    ingredients: [
      i("tuna", 200, "g"),
      i("pasta", 200, "g"),
      i("tomato-sauce", 200, "ml"),
      i("onion", 0.5, "whole"),
      i("garlic", 2, "cloves"),
      i("basil", 10, "g"),
      i("olive-oil", 15, "ml"),
      i("salt", 0.5, "tsp"),
    ],
    steps: [
      "Cook pasta according to the packet.",
      "Soften onion and garlic in oil. Add tomato sauce and simmer for 5 minutes.",
      "Stir in drained tuna until heated through. Toss with pasta and finish with basil.",
    ],
  },
  {
    id: "chicken-burrito",
    name: "Chicken burrito bowl",
    subtitle: "All your favourites in one bowl.",
    time: 30,
    tags: ["Healthy", "High Protein"],
    servings: 2,
    ingredients: [
      i("chicken", 300, "g"),
      i("rice", 150, "g"),
      i("black-beans", 200, "g"),
      i("corn", 100, "g"),
      i("tomato", 150, "g"),
      i("avocado", 1, "whole"),
      i("lime", 1, "whole"),
      i("yogurt", 60, "g"),
      i("olive-oil", 15, "ml"),
      i("salt", 0.5, "tsp"),
    ],
    steps: [
      "Cook the rice. Pan-fry seasoned chicken in oil until its thickest part reaches 75°C, then slice.",
      "Warm the beans and corn. Chop tomatoes and slice the avocado.",
      "Divide everything between bowls. Finish with yogurt and a squeeze of lime.",
    ],
  },
  {
    id: "grilled-salmon",
    name: "Grilled salmon",
    subtitle: "Bright lemon and a beautiful sear.",
    time: 20,
    tags: ["Healthy", "High Protein", "Quick Meals"],
    servings: 2,
    ingredients: [
      i("salmon", 350, "g"),
      i("broccoli", 250, "g"),
      i("lemon", 1, "whole"),
      i("garlic", 2, "cloves"),
      i("olive-oil", 20, "ml"),
      i("salt", 0.5, "tsp"),
      i("pepper", 0.25, "tsp"),
    ],
    steps: [
      "Heat a grill pan and steam the broccoli.",
      "Rub salmon with oil, chopped garlic, salt and pepper. Grill on both sides until cooked through and flaking easily.",
      "Serve with broccoli and lemon wedges.",
    ],
  },
);

// Illustrative nutrition estimates per serving, not lab-tested dietary values.
const nutrition = [
  [520, 17],
  [610, 43],
  [540, 38],
  [650, 39],
  [620, 42],
  [410, 19],
  [480, 33],
  [580, 37],
  [490, 16],
  [620, 44],
  [590, 37],
  [720, 42],
  [470, 48],
  [630, 46],
  [580, 35],
  [690, 45],
  [420, 38],
];
const localImages: Record<string, string> = {
  "pesto-pasta": "pesto-pasta",
  "chicken-rice": "chicken-rice",
  "salmon-bowl": "salmon-bowl",
  "beef-pasta": "beef-pasta",
  "shaking-beef": "shaking-beef",
  "chickpea-salad": "chickpea-salad",
  "pho-beef": "pho-beef",
  "garlic-prawns": "garlic-prawns",
  "egg-fried-rice": "egg-fried-rice",
  "teriyaki-chicken": "chicken-rice",
  "chicken-fried-rice": "egg-fried-rice",
  "chicken-curry": "chicken-curry",
  "steak-vegetables": "shaking-beef",
  "garlic-butter-chicken": "chicken-rice",
  "tuna-pasta": "garlic-prawns",
  "chicken-burrito": "chicken-burrito",
  "grilled-salmon": "salmon-bowl",
};

const vietnameseRecipes: Recipe[] = [
  {
    id: "thit-kho-trung",
    name: "Thịt kho trứng",
    subtitle:
      "Nồi kho đậm đà cho bữa cơm nhà. Có thể giảm đường hoặc đổi phần thịt theo ý bạn.",
    time: 65,
    servings: 2,
    difficulty: "Medium",
    calories: 0,
    protein: 0,
    category: "Vietnamese",
    tags: ["Vietnamese", "High Protein"],
    image: "/images/thit-kho-trung.png",
    ingredients: [
      i("pork-belly", 350, "g"),
      i("egg", 3, "whole"),
      i("coconut-water", 300, "ml"),
      i("fish-sauce", 25, "ml"),
      i("sugar", 15, "g"),
      i("shallot", 30, "g"),
      i("garlic", 2, "cloves"),
      i("pepper", 0.25, "tsp"),
      i("rice", 180, "g"),
      i("cucumber", 1, "whole"),
      i("scallion", 10, "g"),
      i("chili", 1, "whole"),
    ],
    steps: [
      "Luộc trứng chín, bóc vỏ. Cắt thịt thành miếng, ướp với nước mắm, hành tím, tỏi và tiêu khoảng 15 phút.",
      "Thắng đường với ít nước đến màu cánh gián nhạt. Cho thịt vào đảo săn, rồi thêm nước dừa và nước vừa ngập thịt.",
      "Kho lửa nhỏ 35–45 phút đến khi thịt mềm. Cho trứng vào kho thêm 10 phút, nêm lại theo khẩu vị.",
      "Nấu cơm từ lượng gạo khô đã ghi. Dọn thịt kho với cơm, dưa leo, hành lá và ớt nếu thích.",
    ],
  },
  {
    id: "ga-kho-gung",
    name: "Gà kho gừng",
    subtitle: "Ấm bụng, thơm gừng, rất hợp một ngày bận rộn.",
    time: 30,
    servings: 2,
    difficulty: "Easy",
    calories: 0,
    protein: 0,
    category: "Vietnamese",
    tags: ["Vietnamese", "High Protein", "Quick Meals"],
    image: "/images/recipe-placeholder.svg",
    ingredients: [
      i("chicken", 350, "g"),
      i("ginger", 30, "g"),
      i("shallot", 25, "g"),
      i("fish-sauce", 20, "ml"),
      i("sugar", 8, "g"),
      i("cooking-oil", 10, "ml"),
      i("pepper", 0.25, "tsp"),
      i("rice", 180, "g"),
    ],
    steps: [
      "Nấu cơm. Cắt gà thành miếng, gừng thành sợi, băm hành tím.",
      "Ướp gà với nước mắm, đường, tiêu và một nửa gừng trong 10 phút.",
      "Phi hành với dầu, cho gà vào đảo săn. Thêm phần gừng còn lại và ít nước, đậy nắp kho nhỏ lửa đến khi gà chín kỹ.",
      "Nêm lại theo khẩu vị và dùng với cơm.",
    ],
  },
  {
    id: "canh-chua-ca",
    name: "Canh chua cá",
    subtitle: "Vị chua thanh, nhiều rau. Đổi cá sang tôm cũng ngon.",
    time: 30,
    servings: 2,
    difficulty: "Easy",
    calories: 0,
    protein: 0,
    category: "Vietnamese",
    tags: ["Vietnamese", "Healthy", "Quick Meals"],
    image: "/images/recipe-placeholder.svg",
    ingredients: [
      i("white-fish", 300, "g"),
      i("tomato-viet", 150, "g"),
      i("pineapple", 150, "g"),
      i("okra", 100, "g"),
      i("bean-sprouts", 100, "g"),
      i("tamarind", 20, "g"),
      i("fish-sauce", 15, "ml"),
      i("sugar", 8, "g"),
      i("herbs", 10, "g"),
      i("rice", 180, "g"),
    ],
    steps: [
      "Nấu cơm. Cắt cà chua, dứa và đậu bắp. Ngâm me với nước nóng rồi lọc lấy nước cốt.",
      "Đun khoảng 700 ml nước với nước me, dứa và cà chua. Thêm cá và nấu đến khi cá chín, dễ tách bằng nĩa.",
      "Cho đậu bắp và giá vào, nấu vừa chín. Nêm nước mắm, đường rồi thêm rau mùi.",
      "Dùng với cơm. Có thể đổi cá sang tôm bằng cách tạo bản biến tấu riêng.",
    ],
  },
  {
    id: "rau-muong-xao-toi",
    name: "Rau muống xào tỏi",
    subtitle: "Món rau quen thuộc, nấu nhanh, ghép với món kho rất hợp.",
    time: 15,
    servings: 2,
    difficulty: "Easy",
    calories: 0,
    protein: 0,
    category: "Vietnamese",
    tags: ["Vietnamese", "Vegetarian", "Quick Meals"],
    image: "/images/recipe-placeholder.svg",
    ingredients: [
      i("water-spinach", 300, "g"),
      i("garlic", 4, "cloves"),
      i("cooking-oil", 15, "ml"),
      i("salt", 0.5, "tsp"),
    ],
    steps: [
      "Nhặt và rửa rau muống, để ráo. Đập dập tỏi.",
      "Đun nóng dầu, phi thơm một nửa tỏi. Cho rau vào đảo nhanh với ít nước.",
      "Nêm muối theo khẩu vị, thêm phần tỏi còn lại và đảo đến khi rau chín vừa. Dùng nóng.",
    ],
  },
  {
    id: "dau-hu-sot-ca",
    name: "Đậu hũ sốt cà chua",
    subtitle: "Một món chay nhẹ nhàng, dễ đổi lượng sốt theo ý bạn.",
    time: 25,
    servings: 2,
    difficulty: "Easy",
    calories: 0,
    protein: 0,
    category: "Vietnamese",
    tags: ["Vietnamese", "Vegetarian", "Quick Meals"],
    image: "/images/recipe-placeholder.svg",
    ingredients: [
      i("tofu", 300, "g"),
      i("tomato-viet", 250, "g"),
      i("scallion", 15, "g"),
      i("shallot", 20, "g"),
      i("soy-sauce", 15, "ml"),
      i("cooking-oil", 20, "ml"),
      i("sugar", 5, "g"),
      i("rice", 180, "g"),
    ],
    steps: [
      "Nấu cơm. Cắt đậu hũ thành miếng, cà chua thành múi, băm hành tím.",
      "Áp chảo đậu hũ với một phần dầu đến khi vàng nhẹ rồi lấy ra.",
      "Phi hành tím, cho cà chua vào nấu mềm với ít nước. Nêm nước tương và đường.",
      "Cho đậu hũ vào om 5 phút cho thấm sốt, thêm hành lá và dùng với cơm.",
    ],
  },
  {
    id: "trung-chien-thit",
    name: "Trứng chiên thịt",
    subtitle: "Món quen của bữa cơm nhà, nhanh và dễ làm.",
    time: 20,
    servings: 2,
    difficulty: "Easy",
    calories: 0,
    protein: 0,
    category: "Vietnamese",
    tags: ["Vietnamese", "High Protein", "Quick Meals"],
    image: "/images/recipe-placeholder.svg",
    ingredients: [
      i("egg", 3, "whole"),
      i("pork-mince", 120, "g"),
      i("scallion", 15, "g"),
      i("fish-sauce", 10, "ml"),
      i("pepper", 0.25, "tsp"),
      i("cooking-oil", 15, "ml"),
      i("rice", 180, "g"),
    ],
    steps: [
      "Nấu cơm. Đánh trứng với nước mắm, tiêu và hành lá.",
      "Xào thịt heo xay đến khi chín kỹ, tơi đều.",
      "Dàn thịt trong chảo rồi đổ trứng vào. Chiên lửa vừa, trở mặt khi trứng đã chắc và nấu đến khi chín hoàn toàn.",
      "Cắt miếng và dùng với cơm.",
    ],
  },
  {
    id: "canh-cai-thit-bam",
    name: "Canh cải thịt băm",
    subtitle: "Bát canh đơn giản để bữa cơm có thêm rau.",
    time: 20,
    servings: 2,
    difficulty: "Easy",
    calories: 0,
    protein: 0,
    category: "Vietnamese",
    tags: ["Vietnamese", "Healthy", "Quick Meals"],
    image: "/images/recipe-placeholder.svg",
    ingredients: [
      i("mustard-greens", 250, "g"),
      i("pork-mince", 120, "g"),
      i("shallot", 15, "g"),
      i("fish-sauce", 10, "ml"),
      i("salt", 0.25, "tsp"),
      i("cooking-oil", 5, "ml"),
    ],
    steps: [
      "Rửa cải, cắt khúc. Băm hành tím.",
      "Phi hành với dầu, cho thịt băm vào đảo đến khi chín kỹ.",
      "Thêm 600 ml nước, đun sôi. Cho cải vào và nấu vừa chín.",
      "Nêm nước mắm và muối theo khẩu vị, dùng nóng.",
    ],
  },
  {
    id: "bun-bo-xao",
    name: "Bún bò xào sả",
    subtitle: "Một tô bún nhiều rau, nước mắm pha theo khẩu vị của bạn.",
    time: 30,
    servings: 2,
    difficulty: "Easy",
    calories: 0,
    protein: 0,
    category: "Vietnamese",
    tags: ["Vietnamese", "High Protein", "Quick Meals"],
    image: "/images/recipe-placeholder.svg",
    ingredients: [
      i("beef", 250, "g"),
      i("rice-vermicelli", 180, "g"),
      i("lemongrass", 20, "g"),
      i("garlic", 3, "cloves"),
      i("cucumber", 1, "whole"),
      i("bean-sprouts", 100, "g"),
      i("carrot", 1, "whole"),
      i("herbs", 15, "g"),
      i("fish-sauce", 25, "ml"),
      i("sugar", 10, "g"),
      i("lime", 1, "whole"),
      i("cooking-oil", 15, "ml"),
    ],
    steps: [
      "Luộc bún khô theo hướng dẫn trên gói. Thái thịt bò mỏng, băm sả và tỏi.",
      "Ướp bò với sả, một nửa tỏi và ít nước mắm. Rửa rau, thái dưa leo và cà rốt.",
      "Pha nước mắm với nước, đường, nước chanh và phần tỏi còn lại theo khẩu vị.",
      "Xào bò nhanh đến độ chín mong muốn. Xếp bún, rau và bò vào tô, dùng với nước mắm pha.",
    ],
  },
];

export function searchText(value: string) {
  return value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}
export const vietnameseFirst = (a: Recipe, b: Recipe) =>
  Number(b.tags.includes("Vietnamese")) - Number(a.tags.includes("Vietnamese"));

export const recipes: Recipe[] = [
  ...baseRecipes.map<Recipe>((recipe, index) => ({
    ...recipe,
    image: ["pho-beef", "shaking-beef"].includes(recipe.id)
      ? "/images/recipe-placeholder.svg"
      : `/images/${localImages[recipe.id]}.jpg`,
    difficulty: recipe.time > 30 ? "Medium" : "Easy",
    calories: nutrition[index][0],
    protein: nutrition[index][1],
    category: recipe.tags[0],
  })),
  ...vietnameseRecipes,
];
