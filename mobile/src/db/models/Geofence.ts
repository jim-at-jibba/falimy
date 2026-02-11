import { Model } from "@nozbe/watermelondb";
import { date, field, relation, text, writer } from "@nozbe/watermelondb/decorators";
import type Family from "./Family";

export type GeofenceTrigger = "enter" | "exit" | "both";

export default class Geofence extends Model {
  static table = "geofences";

  static associations = {
    families: { type: "belongs_to" as const, key: "family_id" },
  };

  @text("server_id") serverId!: string;
  @field("family_id") familyId!: string;
  @text("name") name!: string;
  @field("lat") lat!: number;
  @field("lng") lng!: number;
  @field("radius") radius!: number;
  @field("notify_user_id") notifyUserId!: string | null;
  @field("watch_user_id") watchUserId!: string | null;
  @text("trigger_on") triggerOn!: GeofenceTrigger | null;
  @field("is_enabled") isEnabled!: boolean;
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("families", "family_id") family!: Family;

  @writer async toggleEnabled() {
    await this.update((geofence) => {
      (geofence as Geofence).isEnabled = !(geofence as Geofence).isEnabled;
    });
  }

  @writer async markDeleted() {
    await super.markAsDeleted();
  }
}
