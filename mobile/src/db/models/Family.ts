import { Model, type Query } from "@nozbe/watermelondb";
import { children, date, field, text, writer } from "@nozbe/watermelondb/decorators";
import type Geofence from "./Geofence";
import type Member from "./Member";
import type ShoppingList from "./ShoppingList";

export default class Family extends Model {
  static table = "families";

  static associations = {
    members: { type: "has_many" as const, foreignKey: "family_id" },
    shopping_lists: { type: "has_many" as const, foreignKey: "family_id" },
    geofences: { type: "has_many" as const, foreignKey: "family_id" },
  };

  @text("server_id") serverId!: string;
  @text("name") name!: string;
  @text("invite_code") inviteCode!: string;
  @text("ntfy_topic_prefix") ntfyTopicPrefix!: string;
  @field("created_by_id") createdById!: string;
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @children("members") members!: Query<Member>;
  @children("shopping_lists") shoppingLists!: Query<ShoppingList>;
  @children("geofences") geofences!: Query<Geofence>;

  @writer async updateName(newName: string) {
    await this.update((family) => {
      (family as Family).name = newName;
    });
  }

  @writer async updateInviteCode(newCode: string) {
    await this.update((family) => {
      (family as Family).inviteCode = newCode;
    });
  }
}
