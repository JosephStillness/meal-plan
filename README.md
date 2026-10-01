# MealMate

A local full-stack meal planner built to teach Next.js, REST APIs, PostgreSQL and a gradual AWS migration. This repository implements **Phase 1**. No AWS account or cloud resources are required.

## What works

- 25 seeded recipes, including 12 Vietnamese home meals. Vietnamese dishes are shown first; search works with or without accents.
- Private recipes: create your own, adapt any visible recipe, edit ingredients/amounts/servings, and add new ingredients by name. Use them in the weekly planner and shopping list.
- Ingredients-only recipes are supported; cooking steps and photos are optional. New/personal recipes show no invented nutrition estimate.
- Recipe search; cuisine, time, difficulty, high-protein and calorie filters.
- Recipe details with ingredients that scale from 1 to 12 servings.
- Meal plans saved by user and Monday-based week; add, replace or remove a day's meal and change its servings.
- Shopping-list generation that scales servings, combines duplicates, converts kg/g and L/ml, and deducts measured pantry stock.
- Grocery categories, purchased checkboxes, quantity editing, deletion, manual additions and text export.
- Pantry creation, quantity editing and deletion. Adding the same ingredient/unit replaces its quantity.
- Local registration/login using scrypt password hashes and opaque database sessions in HttpOnly cookies. Each user's plans, pantry and lists are isolated.
- Warm, readable desktop/mobile pages with 44px touch controls, five-tab mobile/tablet navigation, collapsible advanced filters, reduced-motion support and visible keyboard focus.
- Shopping progress updates as you check items off. Editing quantities preserves purchased checks.

To create a personal recipe, open **Recipes → Thêm công thức riêng**. To adapt a dish, open its detail and choose **Biến tấu món này**. Set quantities for the base serving count, save, then add the recipe to your plan and generate groceries. Find your versions under **Recipes → Của tôi**.

## Run locally

Use Node.js **22.12+** or **24**, npm, and PostgreSQL. Docker Compose is the easiest portable database setup.

```sh
npm install
cp .env.example .env
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register an account, and visit **Meal planner → Try a sample week → Generate shopping list**. Add 200 g of rice in Pantry and regenerate to see measured pantry deduction.

Already have PostgreSQL? Skip Docker, create a database, and set `DATABASE_URL` to its connection string. The development database user needs permission to create Prisma's migration shadow database. Use `npx prisma migrate deploy` to apply existing migrations when that permission is unavailable.

**This workspace is already configured and running** with an isolated native PostgreSQL database on `127.0.0.1:55432`, stored in `/private/tmp/mealmate-postgres-20261001`. Its `.env` is local and ignored by Git. If that temporary server stops, restart it with:

```sh
pg_ctl -D /private/tmp/mealmate-postgres-20261001 \
  -l /private/tmp/mealmate-postgres-20261001/server.log \
  -o '-h 127.0.0.1 -p 55432 -k /private/tmp' start
```

That isolated database uses local trust authentication for development only. For durable work, use the Compose volume or your own PostgreSQL installation with a password. Never point destructive development migration/reset commands at a production database.

## Environment variables

| Variable        | Purpose                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`  | PostgreSQL connection string used only on the server and by Prisma.                                                                       |
| `APP_ORIGIN`    | Browser origin allowed for mutations; defaults to the request host. Use `http://localhost:3000` locally, your HTTPS origin in production. |
| `TEST_BASE_URL` | Optional integration-check target; defaults to `http://localhost:3000`.                                                                   |

Never commit `.env`, database credentials, AWS keys or session tokens. Production variables belong in the hosting environment or a secrets service.

## Architecture

```text
Browser / React components
         │ fetch /api/... (JSON + session cookie)
         ▼
Next.js App Router REST adapter
         ▼
API validation + authorization + Prisma queries
         │
         ├─ pure grocery service (scaling, merging, stock deduction)
         ▼
PostgreSQL
```

```text
src/
  app/          Pages, layouts, styles and the thin REST route adapter
  components/   UI components and the API-backed kitchen state
  services/     REST handlers, recipe mapping and pure grocery logic
  lib/          Prisma connection, local auth, seed recipe data, display helpers
  types/        Frontend API response types
prisma/
  schema.prisma Relationships, foreign keys and uniqueness constraints
  migrations/   Versioned SQL migrations
  seed.ts       Idempotent recipe/ingredient seed
tests/          Pure business-logic checks using Node's test runner
scripts/        An integration check that creates and removes test accounts
```

The route adapter uses native `Request` and `Response`. The business service does not depend on Next.js or Prisma, making it reusable in a Lambda handler. Keep the current folders until there is enough code to justify feature-specific modules.

## Database

`User` owns personal `Recipe` rows, `MealPlan`, `PantryItem`, `ShoppingList` and `Session`. Public seed recipes have a null owner. A `MealPlan` owns daily `MealPlanItem` rows linked to `Recipe`. `RecipeIngredient` joins a recipe to an `Ingredient` and stores quantity/unit. Grocery rows reference the same ingredient catalog.

Unique constraints enforce one plan per user/week, one meal per plan/day, one pantry entry per user/ingredient/unit and one shopping row per list/ingredient/unit. Foreign keys prevent dangling references. Cascades remove a user's private data when that user is deleted, including personal recipes. Public seed recipes and the ingredient catalog remain shared. New ingredient names enter that shared catalog; recipe details stay private.

```sh
npm run db:studio                       # inspect data visually
npm run db:migrate -- --name your_change # after editing the Prisma schema
```

The seed can be rerun without duplicating recipes. Existing recipe ingredient relationships are preserved; to change existing ingredient quantities intentionally, use an explicit data migration or edit them in Prisma Studio.

## REST API

Public recipe/ingredient reads require no account. Recipe reads additionally include the signed-in user’s personal recipes; other accounts cannot view, edit or plan them. Every personal endpoint derives the user from the session cookie; a submitted `userId` is never trusted.

| Method        | Path                                                                      | Purpose                                                                    |
| ------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| GET           | `/api/recipes?q=&category=&maxTime=&difficulty=&minProtein=&maxCalories=` | Search/filter recipe data                                                  |
| GET           | `/api/recipes/:id`                                                        | Recipe and ingredient quantities                                           |
| POST          | `/api/recipes`                                                            | Create a private recipe for the authenticated account                      |
| PATCH         | `/api/recipes/:id`                                                        | Replace your own recipe and ingredients; seed recipes cannot be edited     |
| GET           | `/api/ingredients`                                                        | Shared ingredient catalog                                                  |
| POST          | `/api/auth/register`, `/api/auth/login`                                   | Local account/session                                                      |
| GET           | `/api/auth/me`                                                            | Current user or null                                                       |
| POST          | `/api/auth/logout`                                                        | Revoke session                                                             |
| GET           | `/api/meal-plans?week=YYYY-MM-DD`                                         | User's plans, optionally one week                                          |
| POST          | `/api/meal-plans`                                                         | Create/get plan using `weekStartDate`                                      |
| GET           | `/api/meal-plans/:id`                                                     | User's plan with items                                                     |
| POST          | `/api/meal-plans/:id/items`                                               | Add/replace using `recipeId`, `dayOfWeek` (0 = Monday) and `servings`      |
| DELETE        | `/api/meal-plans/:id/items/:itemId`                                       | Remove meal                                                                |
| DELETE        | `/api/meal-plans/:id/items`                                               | Clear week's meals                                                         |
| POST          | `/api/shopping-list/generate`                                             | Generate using `mealPlanId`                                                |
| GET           | `/api/shopping-list?mealPlanId=...`                                       | Saved grocery list                                                         |
| POST          | `/api/shopping-list/:id/items`                                            | Add existing `ingredientId` or a new `name`/`category`, plus quantity/unit |
| PATCH         | `/api/shopping-list/:id/items/:itemId`                                    | Change quantity/unit or `isPurchased`                                      |
| DELETE        | `/api/shopping-list/:id/items/:itemId`                                    | Remove grocery item                                                        |
| GET, POST     | `/api/pantry`                                                             | Read or upsert using `ingredientId`, quantity/unit                         |
| PATCH, DELETE | `/api/pantry/:id`                                                         | Update quantity/unit or delete                                             |

For recipe creation, submit `name`, `description`, `image`, `cookingTime`, `difficulty` (`Easy`/`Medium`), `calories`, `protein`, `servings`, `category`, `tags`, `steps` and `ingredients: [{ ingredientId, quantity, unit }]`. For a new ingredient, use `{ name, category, quantity, unit }`. `description`, `image`, `calories` and `protein` are optional; `steps` may be empty. POST assigns the session user as owner; PATCH replaces all recipe fields and ingredient rows in one transaction. Repeated ingredient/unit rows merge. Supported units include grams, kilograms, millilitres, litres, teaspoons, tablespoons, whole items, cloves, bunches, packets and pieces. Bodies use JSON; responses return meaningful 400/401/403/404/409 errors and 503 for database failures.

## Important behavior

- A recipe's ingredient quantity is multiplied by `planned servings / recipe servings`.
- Quantities merge by **ingredient ID + compatible normalized unit**, rather than the ingredient's display name.
- `kg → g`, `l → ml` and `tbsp → tsp` (3 tsp per tablespoon). Spoon units remain separate from metric volume units; grams cannot be converted to millilitres without density.
- Pantry stock is subtracted **once from the total**, including partial stock. Deductions never make an item negative.
- Whole ingredients can have fractional recipe requirements (e.g. half an onion). The list reflects requirements rather than rounding to supermarket pack sizes.
- Shopping lists are saved snapshots. After changing meals, recipes or pantry, regenerate. Regeneration replaces manual adjustments, additions and purchased checks; the UI warns first when replacing an existing list.
- Pantry stock is not automatically consumed after a meal or a shopping trip.
- Favourites are a convenience saved in this browser. Meals, pantry, accounts and groceries live in PostgreSQL.
- Nutrition is illustrative, approximate data per serving. Stock food photos are illustrative and may be reused across recipes; they are not photographs of the exact seed recipes.
- Local auth intentionally omits password reset, email verification and distributed rate limiting. Add managed auth before a public production launch.

## Checks

```sh
npm test          # six pure service checks; no database required
npm run typecheck
npm run build
npm run test:api  # requires the local database AND app running
```

The API check verifies private recipe access through API and server-rendered pages, editing without changing public originals, transaction rollback, Vietnamese search, custom ingredient deduplication/scaling and snapshot regeneration, plus authentication, persisted meals, quantity scaling, unit conversion, pantry subtraction, manual edits that preserve purchased checks, invalid servings, cross-origin blocking and access isolation between two users. It uses random temporary accounts and cleans them up. Run it only against a disposable development/test database.

## Learn from each part

| Start here                                                       | What it teaches                                                              |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/app/recipes/[id]/page.tsx` + `components/recipe-detail.tsx` | Server/client component boundaries, props and serving state                  |
| `src/components/store.tsx`                                       | JSON fetches, loading/error feedback and refreshing persisted state          |
| `src/app/api/[...path]/route.ts` + `services/api.ts`             | HTTP verbs, status codes, validation, authorization and transactions         |
| `prisma/schema.prisma` + migrations                              | PostgreSQL relations, foreign keys, indexes and schema versioning            |
| `src/services/grocery.ts` + tests                                | Pure functions, aggregation, normalization and testing business rules        |
| `src/lib/auth.ts`                                                | Password hashing, session cookies and one place to replace auth with Cognito |
| `src/lib/db.ts`                                                  | Reusing database connections during development                              |

## AWS roadmap

1. **Phase 2 — RDS + S3:** first migrate PostgreSQL to RDS, run existing migrations using `prisma migrate deploy`, and replace `DATABASE_URL`. Keep RDS in private subnets with narrowly scoped access; plan the app's VPC connectivity rather than opening PostgreSQL to the internet. The schema and grocery service stay unchanged. See [RDS VPC documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.WorkingWithRDSInstanceinaVPC.html). Then move recipe photos to S3, store their URLs in `Recipe.imageUrl`, and add controlled uploads using [S3 presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html).
2. **Phase 3 — Lambda + API Gateway:** adapt API Gateway's event into the request shape, retain REST URLs, and reuse the services. Keep functions near RDS, plan connection pooling (evaluate RDS Proxy for concurrency), configure least-privilege roles and validate every request. See [API Gateway/Lambda integration](https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway.html). The current local cookie auth is not automatically portable to a separate API domain.
3. **Phase 4 — Cognito:** replace the local login forms/session lookup with a Cognito user pool flow. Verify JWT signature, issuer, expiry and token type; map the stable Cognito subject to the internal user ID so ownership checks still work. See [Cognito access tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-access-token.html). Do not treat the current password/session code as a JWT verifier.
4. **Phase 5 — monitoring and CI/CD:** add CloudWatch logs, structured request IDs, error/latency alarms and dashboards. Create a pipeline for `npm ci → prisma generate → tests → typecheck → build`, deploy staging first, and run approved migrations separately with production secrets. Set budgets and log retention before leaving cloud resources running.

The next cloud step is **RDS migration**, after you can explain the local request → API → Prisma → PostgreSQL flow. No AWS infrastructure has been created or deployed by this implementation.
