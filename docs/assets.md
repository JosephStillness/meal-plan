# Demo assets

Food photographs were downloaded from Unsplash's image CDN and are served locally. They illustrate food categories, not the exact recipe instructions. Replace these with your own dish photographs before treating the app as a published recipe collection.

| Local file          | Unsplash photo identifier        |
| ------------------- | -------------------------------- |
| pesto-pasta.jpg     | photo-1473093295043-cdd812d0e601 |
| chicken-rice.jpg    | photo-1532550907401-a500c9a57435 |
| salmon-bowl.jpg     | photo-1467003909585-2f8a72700288 |
| beef-pasta.jpg      | photo-1551892374-ecf8754cf8b0    |
| shaking-beef.jpg    | photo-1558030006-450675393462    |
| chickpea-salad.jpg  | photo-1512621776951-a57141f2eefd |
| pho-beef.jpg        | photo-1569718212165-3a8278d5f624 |
| garlic-prawns.jpg   | photo-1621996346565-e3dbc646d9a9 |
| egg-fried-rice.jpg  | photo-1603133872878-684f208fb84b |
| chicken-curry.jpg   | photo-1603894584373-5ac82b2ae398 |
| chicken-burrito.jpg | photo-1511690743698-d9d85f2fbf38 |

DM Sans is self-hosted in `public/fonts`. Its font license is the SIL Open Font License; see the bundled license file. Database `imageUrl` values can later point to S3/CDN URLs without changing the recipe components.

## Vietnamese hero

`public/images/thit-kho-trung.png` was generated with the built-in ImageGen tool (`image_gen.imagegen`) for this redesign. It is an AI illustration of the dish, not a photograph documenting the tested recipe.

Prompt:

> Use case: photorealistic-natural. Asset type: MealMate Vietnamese recipe hero photo. Authentic Vietnamese home-cooked thịt kho trứng: a warm brown clay pot of cubed pork belly braised in translucent amber caramel and coconut-water sauce, whole hard-boiled eggs and one egg halved with a firm yellow yolk, a small ceramic bowl of steamed white rice and cucumber slices nearby on a light warm cream table. Natural window light, appetizing honest home cooking, soft earthy sage and beige surroundings, no hands or people, no typography, no logos. Slightly elevated 45-degree editorial food photo, tight composition centred on the clay pot, suitable for square and wide crop. Create one high-quality landscape image.

`public/images/recipe-placeholder.svg` is a neutral illustration written directly as SVG. It is used for dishes and personal recipes without a suitable photo, rather than presenting an unrelated food photograph.
