import { Model, Q, type Query } from "@nozbe/watermelondb";
import {
  children,
  date,
  field,
  lazy,
  relation,
  text,
  writer,
} from "@nozbe/watermelondb/decorators";
import type Family from "./Family";
import type ShoppingItem from "./ShoppingItem";

export type ListStatus = "active" | "completed" | "archived";

export default class ShoppingList extends Model {
  static table = "shopping_lists";

  static associations = {
    families: { type: "belongs_to" as const, key: "family_id" },
    shopping_items: { type: "has_many" as const, foreignKey: "list_id" },
  };

  @text("server_id") serverId!: string;
  @text("name") name!: string;
  @field("family_id") familyId!: string;
  @field("assigned_to_id") assignedToId!: string | null;
  @text("status") status!: ListStatus;
  @field("sort_order") sortOrder!: number;
  @field("created_by_id") createdById!: string | null;
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("families", "family_id") family!: Family;
  @children("shopping_items") items!: Query<ShoppingItem>;

  @lazy uncheckedItems = this.items.extend(Q.where("is_checked", false));
  @lazy checkedItems = this.items.extend(Q.where("is_checked", true));

  @writer async updateName(newName: string) {
    await this.update((list) => {
      (list as ShoppingList).name = newName;
    });
  }

  @writer async updateStatus(newStatus: ListStatus) {
    await this.update((list) => {
      (list as ShoppingList).status = newStatus;
    });
  }

  @writer async archive() {
    await this.update((list) => {
      (list as ShoppingList).status = "archived";
    });
  }

  @writer async markDeleted() {
    await super.markAsDeleted();
  }
}
