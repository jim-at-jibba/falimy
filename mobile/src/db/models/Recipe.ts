import { Model } from "@nozbe/watermelondb";
import {
  date,
  field,
  relation,
  text,
  writer,
} from "@nozbe/watermelondb/decorators";
import type Family from "./Family";

export type RecipeIngredient = { text: string; group?: string };
export type RecipeStep = { text: string; position: number };

export default class Recipe extends Model {
  static table = "recipes";

  static associations = {
    families: { type: "belongs_to" as const, key: "family_id" },
  };

  @text("server_id") serverId!: string;
  @text("title") title!: string;
  @text("description") description!: string | null;
  @text("image") image!: string | null;
  @text("ingredients") ingredientsRaw!: string;
  @text("steps") stepsRaw!: string;
  @field("prep_time") prepTime!: number;
  @field("cook_time") cookTime!: number;
  @field("total_time") totalTime!: number;
  @text("servings") servings!: string | null;
  @text("source_url") sourceUrl!: string | null;
  @text("notes") notes!: string | null;
  @text("tags") tagsRaw!: string | null;
  @field("family_id") familyId!: string;
  @field("created_by_id") createdById!: string | null;
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("families", "family_id") family!: Family;

  /** Parsed ingredients array. */
  get ingredients(): RecipeIngredient[] {
    try {
      return this.ingredientsRaw ? JSON.parse(this.ingredientsRaw) : [];
    } catch {
      return [];
    }
  }

  /** Parsed steps array. */
  get steps(): RecipeStep[] {
    try {
      return this.stepsRaw ? JSON.parse(this.stepsRaw) : [];
    } catch {
      return [];
    }
  }

  /** Parsed tags array. */
  get tags(): string[] {
    try {
      return this.tagsRaw ? JSON.parse(this.tagsRaw) : [];
    } catch {
      return [];
    }
  }

  @writer async updateTitle(newTitle: string) {
    await this.update((recipe) => {
      (recipe as Recipe).title = newTitle;
    });
  }

  @writer async markDeleted() {
    await super.markAsDeleted();
  }
}
