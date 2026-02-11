import { Model } from "@nozbe/watermelondb";
import { date, field, relation, text, writer } from "@nozbe/watermelondb/decorators";
import type Family from "./Family";

export type MemberRole = "admin" | "member" | "child";
export type LocationSharingMode = "off" | "always" | "timed" | "on_request";

export default class Member extends Model {
  static table = "members";

  static associations = {
    families: { type: "belongs_to" as const, key: "family_id" },
  };

  @text("server_id") serverId!: string;
  @text("name") name!: string;
  @text("email") email!: string;
  @text("role") role!: MemberRole;
  @field("family_id") familyId!: string;
  @text("avatar") avatar!: string | null;
  @text("location_sharing_mode") locationSharingMode!: LocationSharingMode | null;
  @date("location_sharing_until") locationSharingUntil!: Date | null;
  @field("last_lat") lastLat!: number | null;
  @field("last_lng") lastLng!: number | null;
  @date("last_location_at") lastLocationAt!: Date | null;
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("families", "family_id") family!: Family;

  @writer async updateRole(newRole: MemberRole) {
    await this.update((member) => {
      (member as Member).role = newRole;
    });
  }

  @writer async updateLocationSharing(mode: LocationSharingMode, until?: Date) {
    await this.update((member) => {
      (member as Member).locationSharingMode = mode;
      (member as Member).locationSharingUntil = until ?? null;
    });
  }

  @writer async updateLastLocation(lat: number, lng: number) {
    await this.update((member) => {
      (member as Member).lastLat = lat;
      (member as Member).lastLng = lng;
      (member as Member).lastLocationAt = new Date();
    });
  }
}
