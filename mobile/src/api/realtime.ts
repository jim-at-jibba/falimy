import type { Database } from "@nozbe/watermelondb";
import type PocketBase from "pocketbase";
import type { UnsubscribeFunc } from "pocketbase";
import { Collections } from "@/types/pocketbase-types";
import { upsertRecord, deleteRecordByServerId } from "@/db/sync";
import { logger } from "@/utils/logger";

/** Collections we want to watch for realtime updates. */
const REALTIME_COLLECTIONS = [
  Collections.Lists,
  Collections.ListItems,
  Collections.Families,
  Collections.Users,
  Collections.LocationHistory,
  Collections.Geofences,
  Collections.Recipes,
];

/**
 * Maps PocketBase collection names to WatermelonDB table names.
 * Inverse of TABLE_TO_COLLECTION in sync.ts.
 */
const COLLECTION_TO_TABLE: Record<string, string> = {
  [Collections.Families]: "families",
  [Collections.Users]: "members",
  [Collections.Lists]: "lists",
  [Collections.ListItems]: "list_items",
  [Collections.LocationHistory]: "location_history",
  [Collections.Geofences]: "geofences",
  [Collections.Recipes]: "recipes",
};

/**
 * Manages PocketBase SSE subscriptions for realtime updates.
 *
 * When a realtime event is received, the record is directly upserted into
 * (or deleted from) WatermelonDB — no full sync needed.
 *
 * Usage:
 *   const rt = new RealtimeManager(pb, database);
 *   await rt.subscribe();
 *   // later...
 *   await rt.unsubscribe();
 */
export class RealtimeManager {
  private pb: PocketBase;
  private database: Database;
  private unsubscribeFns: UnsubscribeFunc[] = [];
  private isSubscribed = false;

  constructor(pb: PocketBase, database: Database) {
    this.pb = pb;
    this.database = database;
  }

  /**
   * Subscribe to all realtime collections.
   * Safe to call multiple times — will not create duplicate subscriptions.
   */
  async subscribe(): Promise<void> {
    if (this.isSubscribed) return;

    for (const collection of REALTIME_COLLECTIONS) {
      try {
        const table = COLLECTION_TO_TABLE[collection];
        if (!table) continue;

        const unsubscribe = await this.pb.collection(collection).subscribe("*", async (data) => {
          try {
            const record = data.record as Record<string, unknown>;

            if (data.action === "delete") {
              const serverId = record.id as string;
              await deleteRecordByServerId(this.database, table, serverId);
            } else {
              // "create" or "update" — upsert into WMDB
              await upsertRecord(this.database, table, record);
            }
          } catch (error) {
            logger.warn(`Failed to process ${data.action} on ${collection}`, {
              component: "realtime",
              collection,
              action: data.action,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        });
        this.unsubscribeFns.push(unsubscribe);
      } catch (error) {
        logger.warn(`Failed to subscribe to ${collection}`, {
          component: "realtime",
          collection,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.isSubscribed = true;
  }

  /**
   * Unsubscribe from all realtime collections.
   */
  async unsubscribe(): Promise<void> {
    for (const fn of this.unsubscribeFns) {
      try {
        await fn();
      } catch (error) {
        logger.warn("Failed to unsubscribe", {
          component: "realtime",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    this.unsubscribeFns = [];
    this.isSubscribed = false;
  }

  /**
   * Whether the manager is currently subscribed.
   */
  get subscribed(): boolean {
    return this.isSubscribed;
  }
}
