import { Model } from "@nozbe/watermelondb";
import { date, field, relation, text, writer } from "@nozbe/watermelondb/decorators";
import type List from "./List";

export default class ListItem extends Model {
  static table = "list_items";

  static associations = {
    lists: { type: "belongs_to" as const, key: "list_id" },
  };

  @text("server_id") serverId!: string;
  @field("list_id") listId!: string;
  @text("name") name!: string;
  @text("quantity") quantity!: string | null;
  @text("note") note!: string | null;
  @field("is_checked") isChecked!: boolean;
  @field("checked_by_id") checkedById!: string | null;
  @field("sort_order") sortOrder!: number;
  @field("created_by_id") createdById!: string | null;
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("lists", "list_id") list!: List;

  @writer async toggleChecked(userId: string) {
    await this.update((item) => {
      const self = item as ListItem;
      self.isChecked = !self.isChecked;
      self.checkedById = self.isChecked ? userId : null;
    });
  }

  @writer async updateDetails(fields: { name?: string; quantity?: string; note?: string }) {
    await this.update((item) => {
      const self = item as ListItem;
      if (fields.name !== undefined) self.name = fields.name;
      if (fields.quantity !== undefined) self.quantity = fields.quantity;
      if (fields.note !== undefined) self.note = fields.note;
    });
  }

  @writer async updateSortOrder(order: number) {
    await this.update((item) => {
      (item as ListItem).sortOrder = order;
    });
  }

  @writer async markDeleted() {
    await super.markAsDeleted();
  }
}
