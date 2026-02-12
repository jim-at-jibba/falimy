import type PocketBase from "pocketbase";
import type { UnsubscribeFunc } from "pocketbase";

/** Collections we want to watch for realtime updates. */
const REALTIME_COLLECTIONS = [
  "lists",
  "list_items",
  "families",
  "users",
  "location_history",
  "geofences",
];

type RealtimeEvent = {
  action: "create" | "update" | "delete";
  record: Record<string, unknown>;
};

type RealtimeCallback = (event: RealtimeEvent, collection: string) => void;

/**
 * Simple callback that just signals something changed, ignoring event details.
 * Used by useRealtime to trigger a sync without inspecting the event.
 */
type SimpleCallback = () => void;

/**
 * Manages PocketBase SSE subscriptions for realtime updates.
 *
 * Usage:
 *   const rt = new RealtimeManager(pb, (event, collection) => {
 *     // trigger sync or update local DB
 *   });
 *   await rt.subscribe();
 *   // later...
 *   await rt.unsubscribe();
 */
export class RealtimeManager {
  private pb: PocketBase;
  private callback: RealtimeCallback | SimpleCallback;
  private unsubscribeFns: UnsubscribeFunc[] = [];
  private isSubscribed = false;

  constructor(pb: PocketBase, callback: RealtimeCallback | SimpleCallback) {
    this.pb = pb;
    this.callback = callback;
  }

  /**
   * Subscribe to all realtime collections.
   * Safe to call multiple times — will not create duplicate subscriptions.
   */
  async subscribe(): Promise<void> {
    if (this.isSubscribed) return;

    for (const collection of REALTIME_COLLECTIONS) {
      try {
        const unsubscribe = await this.pb.collection(collection).subscribe("*", (data) => {
          this.callback(
            {
              action: data.action as RealtimeEvent["action"],
              record: data.record as Record<string, unknown>,
            },
            collection,
          );
        });
        this.unsubscribeFns.push(unsubscribe);
      } catch (error) {
        console.warn(`[Realtime] Failed to subscribe to ${collection}:`, error);
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
        console.warn("[Realtime] Failed to unsubscribe:", error);
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
