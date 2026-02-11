import type { Database } from "@nozbe/watermelondb";
import { synchronize } from "@nozbe/watermelondb/sync";
import type PocketBase from "pocketbase";

import { getPocketBase } from "@/api/pocketbase";

/**
 * Maps WatermelonDB table names to PocketBase collection names.
 * WatermelonDB table "members" maps to PocketBase collection "users" since
 * PocketBase uses a built-in users auth collection.
 */
const TABLE_TO_COLLECTION: Record<string, string> = {
  families: "families",
  members: "users",
  shopping_lists: "shopping_lists",
  shopping_items: "shopping_items",
  location_history: "location_history",
  geofences: "geofences",
};

/**
 * Maps PocketBase record fields to WatermelonDB column names.
 * Only fields that differ between PB and WMDB need mapping.
 */
const PB_TO_WMDB_FIELDS: Record<string, Record<string, string>> = {
  members: {
    id: "server_id",
    family_id: "family_id",
    location_sharing_mode: "location_sharing_mode",
    location_sharing_until: "location_sharing_until",
    last_lat: "last_lat",
    last_lng: "last_lng",
    last_location_at: "last_location_at",
  },
  shopping_items: {
    id: "server_id",
    checked: "is_checked",
    checked_by: "checked_by_id",
    created_by: "created_by_id",
  },
  shopping_lists: {
    id: "server_id",
    assigned_to: "assigned_to_id",
    created_by: "created_by_id",
  },
  families: {
    id: "server_id",
    created_by: "created_by_id",
  },
  location_history: {
    id: "server_id",
    user_id: "user_id",
  },
  geofences: {
    id: "server_id",
    notify_user_id: "notify_user_id",
    watch_user_id: "watch_user_id",
    enabled: "is_enabled",
  },
};

/** Tables that should be synced. */
const SYNC_TABLES = [
  "families",
  "members",
  "shopping_lists",
  "shopping_items",
  "location_history",
  "geofences",
];

/**
 * Convert a PocketBase date string (ISO 8601) to a Unix timestamp in milliseconds.
 * Returns 0 if the value is falsy.
 */
const pbDateToTimestamp = (dateStr: string | null | undefined): number => {
  if (!dateStr) return 0;
  return new Date(dateStr).getTime();
};

/**
 * Convert a Unix timestamp (ms) to a PocketBase-compatible ISO date string.
 */
const timestampToPbDate = (ts: number): string => {
  return new Date(ts).toISOString().replace("T", " ").replace("Z", "");
};

/**
 * Transform a PocketBase record into a WatermelonDB raw record.
 */
const pbRecordToRaw = (table: string, record: Record<string, unknown>): Record<string, unknown> => {
  const fieldMap = PB_TO_WMDB_FIELDS[table] ?? {};
  const raw: Record<string, unknown> = {};

  // Map server ID
  raw.server_id = record.id as string;

  // Map timestamps
  raw.created_at = pbDateToTimestamp(record.created as string);
  raw.updated_at = pbDateToTimestamp(record.updated as string);

  // Map all other fields
  for (const [key, value] of Object.entries(record)) {
    // Skip PocketBase metadata fields
    if (["id", "created", "updated", "collectionId", "collectionName", "expand"].includes(key)) {
      continue;
    }

    const wmdbKey = fieldMap[key] ?? key;
    // Convert date strings to timestamps for date fields
    if (
      (typeof value === "string" && key.endsWith("_at")) ||
      key === "timestamp" ||
      key === "location_sharing_until"
    ) {
      raw[wmdbKey] = pbDateToTimestamp(value as string);
    } else {
      raw[wmdbKey] = value ?? null;
    }
  }

  return raw;
};

/**
 * Transform a WatermelonDB raw record back into a PocketBase record for pushing.
 */
const rawToPbRecord = (table: string, raw: Record<string, unknown>): Record<string, unknown> => {
  const fieldMap = PB_TO_WMDB_FIELDS[table] ?? {};
  // Reverse the field map
  const reverseMap: Record<string, string> = {};
  for (const [pbKey, wmdbKey] of Object.entries(fieldMap)) {
    reverseMap[wmdbKey] = pbKey;
  }

  const pbRecord: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) {
    // Skip WatermelonDB internal fields
    if (["id", "_status", "_changed", "server_id", "created_at", "updated_at"].includes(key)) {
      continue;
    }

    const pbKey = reverseMap[key] ?? key;

    // Convert timestamps back to date strings for date fields
    if (
      typeof value === "number" &&
      (key.endsWith("_at") || key === "timestamp" || key === "location_sharing_until")
    ) {
      pbRecord[pbKey] = value ? timestampToPbDate(value) : null;
    } else {
      pbRecord[pbKey] = value;
    }
  }

  return pbRecord;
};

/**
 * Pull changes from PocketBase for all synced collections since lastPulledAt.
 */
const pullChanges = async (
  pb: PocketBase,
  lastPulledAt: number | null,
): Promise<{
  changes: Record<
    string,
    { created: Record<string, unknown>[]; updated: Record<string, unknown>[]; deleted: string[] }
  >;
  timestamp: number;
}> => {
  const timestamp = Date.now();
  const changes: Record<
    string,
    { created: Record<string, unknown>[]; updated: Record<string, unknown>[]; deleted: string[] }
  > = {};

  for (const table of SYNC_TABLES) {
    const collection = TABLE_TO_COLLECTION[table];
    if (!collection) continue;

    const created: Record<string, unknown>[] = [];
    const updated: Record<string, unknown>[] = [];

    try {
      let filter = "";
      if (lastPulledAt) {
        const lastPulledDate = timestampToPbDate(lastPulledAt);
        filter = `updated > "${lastPulledDate}"`;
      }

      const records = await pb.collection(collection).getFullList({
        filter,
        sort: "-updated",
      });

      for (const record of records) {
        const raw = pbRecordToRaw(table, record as unknown as Record<string, unknown>);

        if (lastPulledAt) {
          const recordCreated = pbDateToTimestamp(
            (record as unknown as Record<string, unknown>).created as string,
          );
          if (recordCreated > lastPulledAt) {
            created.push(raw);
          } else {
            updated.push(raw);
          }
        } else {
          // First sync — all records are "created"
          created.push(raw);
        }
      }
    } catch (error) {
      console.warn(`[Sync] Failed to pull ${collection}:`, error);
    }

    changes[table] = { created, updated, deleted: [] };
  }

  return { changes, timestamp };
};

/**
 * Push local changes to PocketBase.
 */
const pushChanges = async (
  pb: PocketBase,
  changes: Record<
    string,
    { created: Record<string, unknown>[]; updated: Record<string, unknown>[]; deleted: string[] }
  >,
  database: Database,
): Promise<void> => {
  for (const table of SYNC_TABLES) {
    const tableChanges = changes[table];
    if (!tableChanges) continue;

    const collection = TABLE_TO_COLLECTION[table];
    if (!collection) continue;

    // With sendCreatedAsUpdated: true, all new and modified records
    // arrive in the "updated" array. We distinguish them by whether
    // they already have a server_id.
    for (const raw of tableChanges.updated) {
      const pbRecord = rawToPbRecord(table, raw);
      const serverId = raw.server_id as string | undefined;
      const localId = raw.id as string;

      try {
        if (serverId) {
          // Record already exists on server — update it.
          await pb.collection(collection).update(serverId, pbRecord);
        } else {
          // New local record — create on server and write back the server ID.
          const created = await pb.collection(collection).create(pbRecord);
          await database.write(async () => {
            const localRecord = await database.get(table).find(localId);
            await localRecord.update(() => {
              // biome-ignore lint: _raw is the underlying record; server_id is a dynamic column
              (localRecord._raw as any).server_id = created.id;
            });
          });
        }
      } catch (error) {
        console.warn(`[Sync] Failed to push ${collection} record (${localId}):`, error);
        throw error;
      }
    }

    // Handle deleted records
    for (const id of tableChanges.deleted) {
      // The deleted array contains WatermelonDB IDs, but we need server IDs.
      // WatermelonDB sync passes the raw record ID here. We need to look up
      // the server_id. However, since the record is deleted locally, we can't
      // query it. For now, we treat the ID as the server_id if it looks like a
      // PocketBase ID (15 chars). This is a known limitation of client-side sync.
      try {
        await pb.collection(collection).delete(id);
      } catch (error) {
        // Record may already be deleted on server — that's OK
        const status = (error as { status?: number })?.status;
        if (status !== 404) {
          console.warn(`[Sync] Failed to delete ${collection} record ${id}:`, error);
          throw error;
        }
      }
    }
  }
};

/**
 * Perform a full sync cycle between WatermelonDB and PocketBase.
 *
 * Uses WatermelonDB's built-in `synchronize()` function with a client-side
 * adapter that translates between WMDB sync protocol and PocketBase REST API.
 */
export const sync = async (database: Database): Promise<void> => {
  const pb = await getPocketBase();
  if (!pb || !pb.authStore.isValid) {
    console.warn("[Sync] Cannot sync: not authenticated");
    return;
  }

  await synchronize({
    database,
    sendCreatedAsUpdated: true,
    pullChanges: async ({ lastPulledAt }) => {
      return pullChanges(pb, lastPulledAt ?? null);
    },
    pushChanges: async ({ changes }) => {
      await pushChanges(
        pb,
        changes as Record<
          string,
          {
            created: Record<string, unknown>[];
            updated: Record<string, unknown>[];
            deleted: string[];
          }
        >,
        database,
      );
    },
    migrationsEnabledAtVersion: 1,
  });
};
