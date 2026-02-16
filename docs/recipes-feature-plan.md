# Recipes Feature Plan

## Overview

Add a family-shared recipe book to Falimy, following existing patterns. Users can create recipes manually, or paste a URL to auto-extract recipe data from websites using schema.org/Recipe JSON-LD structured data. Mobile-first, with offline support via WatermelonDB.

### Key Decisions

- **Platform:** Mobile first (Expo/React Native), web later
- **Sharing:** Family-shared (all family members can see/edit all recipes)
- **Organization:** Tags/labels (flexible, multi-tag per recipe)
- **Navigation:** Dedicated "Recipes" tab in bottom navigation
- **Images:** Single cover image per recipe
- **Extraction:** Server-side URL parsing via PocketBase hook
- **Scope:** Core recipe CRUD + URL import (meal planning, scaling, timers etc. are future enhancements)

---

## Data Model

### PocketBase Collection: `recipes`

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | text | yes | Recipe name |
| `description` | text | no | Short description/summary |
| `image` | file | no | Single cover image (max 1 file, 5MB) |
| `ingredients` | json | yes | Array of `{ text: string, group?: string }` |
| `steps` | json | yes | Array of `{ text: string, position: number }` |
| `prep_time` | number | no | Minutes |
| `cook_time` | number | no | Minutes |
| `total_time` | number | no | Minutes |
| `servings` | text | no | e.g. "4 servings", "6-8" |
| `source_url` | url | no | Original URL if imported |
| `notes` | text | no | Free-form notes |
| `tags` | json | no | Array of strings e.g. `["dinner", "quick", "vegetarian"]` |
| `family_id` | relation | yes | -> families (same-family access rules) |
| `created_by` | relation | yes | -> users |
| `created` | autodate | - | |
| `updated` | autodate | - | |

**API Rules** (same pattern as `lists`):

- List/View: `@request.auth.id != '' && family_id = @request.auth.family_id`
- Create: `@request.auth.id != '' && family_id = @request.auth.family_id`
- Update: `@request.auth.id != '' && family_id = @request.auth.family_id`
- Delete: `@request.auth.id != '' && family_id = @request.auth.family_id`

### WatermelonDB Table: `recipes`

| Column | Type | Indexed | Optional |
|---|---|---|---|
| `server_id` | string | yes | no |
| `title` | string | no | no |
| `description` | string | no | yes |
| `image` | string | no | yes |
| `ingredients` | string | no | no |
| `steps` | string | no | no |
| `prep_time` | number | no | yes |
| `cook_time` | number | no | yes |
| `total_time` | number | no | yes |
| `servings` | string | no | yes |
| `source_url` | string | no | yes |
| `notes` | string | no | yes |
| `tags` | string | no | yes |
| `family_id` | string | yes | no |
| `created_by_id` | string | yes | yes |
| `created_at` | number | no | no |
| `updated_at` | number | no | no |

Note: `ingredients`, `steps`, and `tags` are stored as JSON strings in WMDB (WatermelonDB doesn't have a JSON column type). The model will have getter/setter helpers to parse/stringify.

---

## URL Recipe Extraction (Server-Side)

### New PocketBase Hook: `extract_recipe.pb.js`

Endpoint: `POST /api/falimy/extract-recipe`

**How it works:**

1. Receives `{ url: string }` from authenticated client
2. Fetches the HTML from the URL using PocketBase's built-in `$http.send()`
3. Parses the HTML to find `<script type="application/ld+json">` blocks
4. Looks for `@type: "Recipe"` in the JSON-LD data (schema.org standard)
5. Extracts and returns normalized recipe data:
   - `title` from `name`
   - `description` from `description`
   - `ingredients` from `recipeIngredient` (array of strings)
   - `steps` from `recipeInstructions` (array of `HowToStep` or strings)
   - `prep_time` from `prepTime` (ISO 8601 duration -> minutes)
   - `cook_time` from `cookTime`
   - `total_time` from `totalTime`
   - `servings` from `recipeYield`
   - `image` URL from `image`
6. Returns the extracted data as JSON -- the client then creates the recipe record

**Fallback:** If no JSON-LD is found, look for microdata `itemtype="http://schema.org/Recipe"` attributes. If that also fails, return an error telling the user the recipe couldn't be auto-extracted and they should enter it manually.

**Image handling for URL imports:** The server downloads the image from the extracted URL and stores it as a PocketBase file attachment on the recipe record, avoiding external image hotlinking.

---

## Implementation Steps

### Step 1: Server -- PocketBase Migration + Hook

**New migration file** (`17XXXXXXXX_add_recipes_collection.js`):

- Create `recipes` collection with all fields and API rules as defined above
- Add input validation (title length limits, URL format, etc.)

**New hook file** (`extract_recipe.pb.js`):

- `POST /api/falimy/extract-recipe` endpoint
- URL fetching + JSON-LD parsing logic
- Rate limiting (same pattern as `join_family.pb.js`)
- Auth required

### Step 2: Mobile -- Database Layer

**Schema update** (`schema.ts`):

- Bump version to 4
- Add `recipes` table with all columns

**Migration** (WatermelonDB schema migration):

- Add migration from version 3 to 4 creating the `recipes` table

**New model** (`Recipe.ts`):

- Follow `List.ts` pattern
- `static table = "recipes"`
- Association: `belongs_to` families
- JSON helper methods for ingredients/steps/tags (parse from string, serialize to string)
- Writer methods for common mutations

**Sync updates** (`sync.ts`):

- Add `recipes` to `TABLE_TO_COLLECTION` map
- Add `recipes` to `PB_TO_WMDB_FIELDS` map (e.g., `created_by` -> `created_by_id`)
- Add `recipes` to `SYNC_TABLES` array

**PocketBase types update:**

- Add `Recipes` to `Collections` enum
- Add `RecipesRecord` type, response type, and create/update utility types

### Step 3: Mobile -- Hook + Context

**New hook** (`useRecipes.ts`):

- Following `useLists()` pattern
- `recipes` -- observable query of all family recipes from WMDB
- `createRecipe(data)` -- create on PB first, upsert locally
- `updateRecipe(serverId, data)` -- update on PB, upsert locally
- `deleteRecipe(serverId)` -- delete on PB, delete locally
- `extractRecipeFromUrl(url)` -- call server endpoint, return extracted data
- `createRecipeFromUrl(url)` -- extract + create in one flow (including image download)
- `searchRecipes(query)` -- local text search on title/tags
- `filterByTag(tag)` -- filter recipes by tag

### Step 4: Mobile -- UI Screens

**New tab** in `(tabs)/_layout.tsx`:

- Add "Recipes" tab between Lists and Map
- Icon: `CookingPot` or `ChefHat` from lucide-react-native

**Screen: Recipe List** (`(tabs)/recipes/index.tsx`):

- Grid or list view of recipe cards showing: cover image (or placeholder), title, tags, cook time
- Search bar at top
- Tag filter chips (horizontal scroll)
- FAB or header button to add new recipe
- Tap a recipe to navigate to detail view

**Screen: Recipe Detail** (`recipe/[id].tsx`):

- Hero cover image at top
- Title, description, metadata (prep/cook/total time, servings)
- Source URL link if imported
- Ingredients section with group headers if applicable
- Steps section -- numbered step-by-step
- Notes section
- Tags displayed as chips
- Edit button (pencil icon in header)
- Delete option (in menu or settings)

**Screen: Add/Edit Recipe** (`recipe/create.tsx` or `recipe/edit/[id].tsx`):

- Two entry modes at top:
  1. **"Import from URL"** -- text input for URL + "Extract" button
  2. **"Create manually"** -- form fills
- When URL is extracted, form auto-populates with extracted data, user can review/edit before saving
- Form fields:
  - Title (text input)
  - Cover image (image picker -- camera or gallery via `expo-image-picker`)
  - Description (text input)
  - Ingredients (dynamic list -- add/remove/reorder, optional grouping)
  - Steps (dynamic list -- add/remove/reorder)
  - Prep time, cook time, total time (number inputs with "min" suffix)
  - Servings (text input)
  - Notes (multiline text input)
  - Tags (chip input -- type to add, tap to remove, suggest from existing tags)
- Save button

### Step 5: Mobile -- Realtime + Polish

- Add `recipes` SSE subscription in `useRealtime` hook
- Test offline creation/editing
- Pull-to-refresh on recipe list
- Empty state for no recipes
- Loading skeletons
- Image caching/optimization

---

## File Changes Summary

| File | Change |
|---|---|
| `server/pb_migrations/17XXXXXXXX_add_recipes.js` | **New** -- migration creating `recipes` collection |
| `server/pb_hooks/extract_recipe.pb.js` | **New** -- URL extraction endpoint |
| `mobile/src/db/schema.ts` | **Edit** -- bump to v4, add `recipes` table |
| `mobile/src/db/migrations.ts` | **Edit** -- add v3->v4 migration |
| `mobile/src/db/models/Recipe.ts` | **New** -- WatermelonDB model |
| `mobile/src/db/models/index.ts` | **Edit** -- export Recipe model |
| `mobile/src/db/sync.ts` | **Edit** -- add recipes to sync tables/mappings |
| `mobile/src/types/pocketbase-types.ts` | **Edit** -- add recipe types |
| `mobile/src/hooks/useRecipes.ts` | **New** -- CRUD + extraction hook |
| `mobile/src/hooks/useRealtime.ts` | **Edit** -- add recipes SSE subscription |
| `mobile/src/app/(tabs)/_layout.tsx` | **Edit** -- add Recipes tab |
| `mobile/src/app/(tabs)/recipes/index.tsx` | **New** -- recipe list screen |
| `mobile/src/app/recipe/[id].tsx` | **New** -- recipe detail screen |
| `mobile/src/app/recipe/create.tsx` | **New** -- add/edit recipe screen |
| `mobile/src/components/RecipeCard.tsx` | **New** -- recipe card component |

---

## Technical Notes

### JSON-LD for Extraction

~75% of recipe websites include schema.org/Recipe structured data. This is the same approach used by Crouton, Saffron, and other recipe apps. Reliable and doesn't require site-specific scrapers.

### Server-Side Extraction

Avoids CORS issues, centralizes scraping logic, allows image proxying/storage. Uses PocketBase's built-in `$http.send()` -- no external dependencies needed.

### JSON Fields for Ingredients/Steps

Stored as JSON arrays in PocketBase (native JSON field type) and as stringified JSON in WatermelonDB. This avoids needing separate `recipe_ingredients` and `recipe_steps` collections, keeping the data model simpler. The tradeoff is no individual ingredient querying, but that's not needed for this use case.

### Tags as JSON Array

Simple and flexible. No separate tags collection needed. Filtering works by scanning the JSON array client-side (fine for the expected volume of family recipes).

### Image Storage on PocketBase

For URL imports, the server downloads the image and stores it as a PocketBase file. This means images work offline (synced via WMDB reference) and don't break if the source website goes down.

---

## Future Enhancements (Not in initial scope)

- **Meal planning** -- Weekly calendar assigning recipes to days
- **Grocery integration** -- Generate shopping list items from recipe ingredients
- **Recipe scaling** -- Multiply/divide ingredient quantities
- **Measurement conversion** -- Metric/imperial toggle
- **Step-by-step cooking mode** -- Full-screen step view with timers
- **OCR/AI scanning** -- Photograph cookbook pages to extract recipes
- **Recipe sharing** -- Share recipes with non-family members via link
- **Collections/folders** -- Group recipes beyond tags
- **Web app support** -- Port the feature to the TanStack Start web app
