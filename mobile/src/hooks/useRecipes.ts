import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import type Recipe from "@/db/models/Recipe";
import type { RecipeIngredient, RecipeStep } from "@/db/models/Recipe";
import { upsertRecord, deleteRecordByServerId } from "@/db/sync";

type ExtractedRecipe = {
  title: string | null;
  description: string | null;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  servings: string | null;
  image_url: string | null;
  source_url: string;
};

type CreateRecipeData = {
  title: string;
  description?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings?: string;
  source_url?: string;
  notes?: string;
  tags?: string[];
  image?: File;
};

type UpdateRecipeData = Partial<Omit<CreateRecipeData, "image">> & {
  image?: File;
};

type UseRecipesResult = {
  /** All recipes for the user's family, sorted by most recently updated. */
  recipes: Recipe[];
  /** Whether the initial load is still in progress. */
  isLoading: boolean;
  /** Create a new recipe. Returns the created recipe's PB server ID. */
  createRecipe: (data: CreateRecipeData) => Promise<string>;
  /** Update an existing recipe. */
  updateRecipe: (serverId: string, data: UpdateRecipeData) => Promise<void>;
  /** Delete a recipe. */
  deleteRecipe: (serverId: string) => Promise<void>;
  /** Extract recipe data from a URL using the server endpoint. */
  extractRecipeFromUrl: (url: string) => Promise<ExtractedRecipe>;
};

/**
 * Reactively observes recipes for the current user's family.
 *
 * Mutations go to PocketBase first, then upsert the result into WatermelonDB.
 */
export const useRecipes = (): UseRecipesResult => {
  const database = useDatabase();
  const { user, pb } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.family_id) {
      setRecipes([]);
      setIsLoading(false);
      return;
    }

    const collection = database.get<Recipe>("recipes");
    const query = collection.query(
      Q.where("family_id", user.family_id),
      Q.sortBy("updated_at", Q.desc),
    );

    const subscription = query.observe().subscribe({
      next: (results) => {
        setRecipes(results);
        setIsLoading(false);
      },
      error: (error) => {
        console.warn("[useRecipes] Observe error:", error);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [database, user?.family_id]);

  const createRecipe = async (data: CreateRecipeData): Promise<string> => {
    if (!user?.family_id) {
      throw new Error("Cannot create recipe: no family_id. Please log in and join a family first.");
    }
    if (!pb) {
      throw new Error("Cannot create recipe: PocketBase not available.");
    }

    let pbRecord;

    if (data.image) {
      // Use FormData when an image is provided
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description ?? "");
      formData.append("ingredients", JSON.stringify(data.ingredients));
      formData.append("steps", JSON.stringify(data.steps));
      formData.append("prep_time", String(data.prep_time ?? 0));
      formData.append("cook_time", String(data.cook_time ?? 0));
      formData.append("total_time", String(data.total_time ?? 0));
      formData.append("servings", data.servings ?? "");
      formData.append("source_url", data.source_url ?? "");
      formData.append("notes", data.notes ?? "");
      if (data.tags) {
        formData.append("tags", JSON.stringify(data.tags));
      }
      formData.append("family_id", user.family_id);
      formData.append("created_by", user.id);
      formData.append("image", data.image);

      pbRecord = await pb.collection("recipes").create(formData);
    } else {
      // Use plain object when no image
      pbRecord = await pb.collection("recipes").create({
        title: data.title,
        description: data.description ?? "",
        ingredients: data.ingredients,
        steps: data.steps,
        prep_time: data.prep_time ?? 0,
        cook_time: data.cook_time ?? 0,
        total_time: data.total_time ?? 0,
        servings: data.servings ?? "",
        source_url: data.source_url ?? "",
        notes: data.notes ?? "",
        tags: data.tags ?? [],
        family_id: user.family_id,
        created_by: user.id,
      });
    }

    await upsertRecord(database, "recipes", pbRecord as unknown as Record<string, unknown>);
    return pbRecord.id;
  };

  const updateRecipe = async (serverId: string, data: UpdateRecipeData): Promise<void> => {
    if (!pb) throw new Error("PocketBase not available.");

    let pbRecord;

    if (data.image) {
      // Use FormData when an image is provided
      const formData = new FormData();
      if (data.title !== undefined) formData.append("title", data.title);
      if (data.description !== undefined) formData.append("description", data.description);
      if (data.ingredients !== undefined) formData.append("ingredients", JSON.stringify(data.ingredients));
      if (data.steps !== undefined) formData.append("steps", JSON.stringify(data.steps));
      if (data.prep_time !== undefined) formData.append("prep_time", String(data.prep_time));
      if (data.cook_time !== undefined) formData.append("cook_time", String(data.cook_time));
      if (data.total_time !== undefined) formData.append("total_time", String(data.total_time));
      if (data.servings !== undefined) formData.append("servings", data.servings);
      if (data.source_url !== undefined) formData.append("source_url", data.source_url);
      if (data.notes !== undefined) formData.append("notes", data.notes);
      if (data.tags !== undefined) formData.append("tags", JSON.stringify(data.tags));
      formData.append("image", data.image);

      pbRecord = await pb.collection("recipes").update(serverId, formData);
    } else {
      // Build update object with only provided fields
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.ingredients !== undefined) updateData.ingredients = data.ingredients;
      if (data.steps !== undefined) updateData.steps = data.steps;
      if (data.prep_time !== undefined) updateData.prep_time = data.prep_time;
      if (data.cook_time !== undefined) updateData.cook_time = data.cook_time;
      if (data.total_time !== undefined) updateData.total_time = data.total_time;
      if (data.servings !== undefined) updateData.servings = data.servings;
      if (data.source_url !== undefined) updateData.source_url = data.source_url;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.tags !== undefined) updateData.tags = data.tags;

      pbRecord = await pb.collection("recipes").update(serverId, updateData);
    }

    await upsertRecord(database, "recipes", pbRecord as unknown as Record<string, unknown>);
  };

  const deleteRecipe = async (serverId: string): Promise<void> => {
    if (!pb) throw new Error("PocketBase not available.");

    await pb.collection("recipes").delete(serverId);
    await deleteRecordByServerId(database, "recipes", serverId);
  };

  const extractRecipeFromUrl = async (url: string): Promise<ExtractedRecipe> => {
    if (!pb) throw new Error("PocketBase not available.");

    const response = await fetch(`${pb.baseUrl}/api/falimy/extract-recipe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pb.authStore.token}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to extract recipe: ${response.status}`);
    }

    const result = await response.json();
    return result as ExtractedRecipe;
  };

  return { recipes, isLoading, createRecipe, updateRecipe, deleteRecipe, extractRecipeFromUrl };
};
