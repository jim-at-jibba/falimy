import { Model } from "@nozbe/watermelondb";
import { date, field, text } from "@nozbe/watermelondb/decorators";

export default class LocationHistory extends Model {
  static table = "location_history";

  @text("server_id") serverId!: string;
  @field("user_id") userId!: string;
  @field("lat") lat!: number;
  @field("lng") lng!: number;
  @field("accuracy") accuracy!: number | null;
  @field("battery_level") batteryLevel!: number | null;
  @date("timestamp") timestamp!: Date;
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;
}
