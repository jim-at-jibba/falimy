import { Q } from "@nozbe/watermelondb";
import type { Database } from "@nozbe/watermelondb";
import type PocketBase from "pocketbase";

import { getPocketBase } from "@/api/pocketbase";
import { Collections } from "@/types/pocketbase-types";
import { logger } from "@/utils/logger";

/**
 * New sync architecture: PocketBase is the source of truth, WatermelonDB is a
 * local reactive cache.
 *
 * - Pull: fetch all records from PB and upsert into WMDB by server_id.
 * - Mutations: hooks create/update/delete on PB first, then upsert locally.
 * - Realtime: SSE events upsert the received record directly into WMDB.
 *
 * There is NO push. WatermelonDB's `synchronize()` is not used.
 * All relation fields in WMDB store PocketBase server IDs.
 */

// ---------------------------------------------------------------------------
// Table / field mapping
// ---------------------------------------------------------------------------

/** Maps WatermelonDB table names to PocketBase collection names. */
const TABLE_TO_COLLECTION: Record<string, string> = {
  families: Collections.Families,
  members: Collections.Users,
  lists: Collections.Lists,
  list_items: Collections.ListItems,
  location_history: Collections.LocationHistory,
  geofences: Collections.Geofences,
};

/**
 * Maps PocketBase record fields to WatermelonDB column names.
 * Only fields that differ between PB and WMDB need mapping.
 */
const PB_TO_WMDB_FIELDS: Record<string, Record<string, string>> = {
  members: {
    location_sharing_mode: "location_sharing_mode",
    location_sharing_until: "location_sharing_until",
    last_lat: "last_lat",
    last_lng: "last_lng",
    last_location_at: "last_location_at",
    location_history_retention_days: "location_history_retention_days",
  },
  list_items: {
    checked: "is_checked",
    checked_by: "checked_by_id",
    created_by: "created_by_id",
  },
  lists: {
    assigned_to: "assigned_to_id",
    created_by: "created_by_id",
  },
  families: {
    created_by: "created_by_id",
  },
  location_history: {
    user_id: "user_id",
  },
  geofences: {
    notify_user_id: "notify_user_id",
    watch_user_id: "watch_user_id",
    enabled: "is_enabled",
  },
};

/** Tables that should be synced. */
const SYNC_TABLES = [
  "families",
  "members",
  "lists",
  "list_items",
  "location_history",
  "geofences",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a PocketBase date string (ISO 8601) to a Unix timestamp in ms.
 * Returns 0 if the value is falsy.
 */
const pbDateToTimestamp = (dateStr: string | null | undefined): number => {
  if (!dateStr) return 0;
  return new Date(dateStr).getTime();
};

/**
 * Transform a PocketBase record into a flat object suitable for writing into
 * WatermelonDB via `_raw`.
 *
 * All relation IDs are kept as PB server IDs — no translation needed because
 * PB is the source of truth.
 */
const pbRecordToLocal = (
  table: string,
  record: Record<string, unknown>,
): Record<string, unknown> => {
  const fieldMap = PB_TO_WMDB_FIELDS[table] ?? {};
  const local: Record<string, unknown> = {};

  // server_id is always the PB id
  local.server_id = record.id as string;

  // Map timestamps
  local.created_at = pbDateToTimestamp(record.created as string);
  local.updated_at = pbDateToTimestamp(record.updated as string);

  // Map all other fields
  for (const [key, value] of Object.entries(record)) {
    // Skip PocketBase metadata fields
    if (
      ["id", "created", "updated", "collectionId", "collectionName", "expand"].includes(key)
    ) {
      continue;
    }

    const wmdbKey = fieldMap[key] ?? key;

    // Convert date strings to timestamps for date fields
    if (
      typeof value === "string" &&
      (key.endsWith("_at") || key === "timestamp" || key === "location_sharing_until")
    ) {
      local[wmdbKey] = pbDateToTimestamp(value);
    } else if (value !== null && typeof value === "object") {
      // JSON fields come from PB as parsed objects/arrays — WMDB needs strings
      local[wmdbKey] = JSON.stringify(value);
    } else {
      local[wmdbKey] = value ?? null;
    }
  }

  return local;
};

// ---------------------------------------------------------------------------
// Upsert — the core building block
// ---------------------------------------------------------------------------

/**
 * Upsert a single PocketBase record into WatermelonDB.
 *
 * Looks up an existing local record by `server_id`. If found, updates it.
 * Otherwise creates a new record.
 *
 * This is exported so hooks and the realtime system can call it directly
 * after writing to PocketBase.
 */
export const upsertRecord = async (
  database: Database,
  table: string,
  pbRecord: Record<string, unknown>,
): Promise<void> => {
  const local = pbRecordToLocal(table, pbRecord);
  const serverId = local.server_id as string;

  await database.write(async () => {
    const collection = database.get(table);

    // Find existing record by server_id — inside write() to prevent race conditions
    const existing = await collection
      .query(Q.where("server_id", serverId))
      .fetch();

    if (existing.length > 0) {
      // Update existing record
      const record = existing[0];
      await record.update(() => {
        const raw = record._raw as Record<string, unknown>;
        for (const [key, value] of Object.entries(local)) {
          if (key !== "id") {
            raw[key] = value;
          }
        }
      });
    } else {
      // Create new record
      await collection.create((rec) => {
        const raw = rec._raw as Record<string, unknown>;
        for (const [key, value] of Object.entries(local)) {
          if (key !== "id") {
            raw[key] = value;
          }
        }
      });
    }
  });
};

/**
 * Delete a local record by its PocketBase server_id.
 *
 * Used when a realtime "delete" event is received or after a successful
 * PB deletion from a hook.
 */
export const deleteRecordByServerId = async (
  database: Database,
  table: string,
  serverId: string,
): Promise<void> => {
  await database.write(async () => {
    const collection = database.get(table);
    const existing = await collection
      .query(Q.where("server_id", serverId))
      .fetch();

    if (existing.length > 0) {
      await existing[0].destroyPermanently();
    }
  });
};

// ---------------------------------------------------------------------------
// Deduplication — clean up duplicates caused by past race conditions
// ---------------------------------------------------------------------------

/** All tables that have a server_id column (includes recipes which is not in SYNC_TABLES). */
const ALL_TABLES_WITH_SERVER_ID = [
  ...SYNC_TABLES,
  "recipes",
];

/**
 * Find and remove duplicate records that share the same `server_id` within
 * each table. Keeps the record with the highest `updated_at` (newest) and
 * destroys the rest.
 *
 * Returns the total number of duplicate records removed.
 */
export const deduplicateRecords = async (
  database: Database,
): Promise<number> => {
  let totalRemoved = 0;

  for (const table of ALL_TABLES_WITH_SERVER_ID) {
    try {
      const allRecords = await database.get(table).query().fetch();

      // Group records by server_id
      const byServerId = new Map<string, typeof allRecords>();
      for (const rec of allRecords) {
        const sid = (rec._raw as Record<string, unknown>).server_id as string;
        if (!sid) continue;
        const group = byServerId.get(sid);
        if (group) {
          group.push(rec);
        } else {
          byServerId.set(sid, [rec]);
        }
      }

      // Collect duplicates to remove
      const toDestroy: typeof allRecords = [];
      for (const [, group] of byServerId) {
        if (group.length <= 1) continue;

        // Sort descending by updated_at — keep the first (newest)
        group.sort((a, b) => {
          const aTime = (a._raw as Record<string, unknown>).updated_at as number ?? 0;
          const bTime = (b._raw as Record<string, unknown>).updated_at as number ?? 0;
          return bTime - aTime;
        });

        // Everything after the first is a duplicate
        for (let i = 1; i < group.length; i++) {
          toDestroy.push(group[i]);
        }
      }

      if (toDestroy.length > 0) {
        await database.write(async () => {
          for (const rec of toDestroy) {
            await rec.destroyPermanently();
          }
        });
        totalRemoved += toDestroy.length;
        logger.info(`Removed ${toDestroy.length} duplicate(s) from ${table}`, {
          component: "sync",
        });
      }
    } catch (error) {
      logger.warn(`Dedup failed for ${table}`, {
        component: "sync",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.info(`Deduplication complete: ${totalRemoved} duplicate(s) removed`, {
    component: "sync",
  });

  return totalRemoved;
};

// ---------------------------------------------------------------------------
// Pull — fetch everything from PB and upsert into WMDB
// ---------------------------------------------------------------------------

/**
 * Pull all records from PocketBase for the synced tables and upsert them
 * into WatermelonDB.
 *
 * This replaces WatermelonDB's `synchronize()`. It is purely additive /
 * updating — it does not delete local records that were removed on the
 * server (that is handled by realtime delete events or a separate
 * reconciliation step if needed).
 */
const pullAll = async (database: Database, pb: PocketBase): Promise<void> => {
  // Read retention setting from the PB auth record (synced across devices)
  const retentionDays = (pb.authStore.record as Record<string, unknown> | null)?.location_history_retention_days as number | undefined ?? 30;

  for (const table of SYNC_TABLES) {
    const collectionName = TABLE_TO_COLLECTION[table];
    if (!collectionName) continue;

    try {
      // For location_history, apply retention filter if not "never" (0)
      const fetchOptions: { sort: string; filter?: string } = { sort: "-updated" };
      let cutoffISO: string | null = null;

      if (table === "location_history" && retentionDays > 0) {
        const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
        cutoffISO = cutoff.toISOString().replace("T", " ");
        fetchOptions.filter = `timestamp >= "${cutoffISO}"`;
      }

      const records = await pb.collection(collectionName).getFullList(fetchOptions);

      // Build a map of existing server_ids for this table to batch-check
      const existingRecords = await database.get(table).query().fetch();
      const serverIdToLocal = new Map<string, typeof existingRecords[0]>();
      for (const rec of existingRecords) {
        const sid = (rec._raw as Record<string, unknown>).server_id as string;
        if (sid) {
          serverIdToLocal.set(sid, rec);
        }
      }

      // Collect server IDs we received — used to detect deletions
      const receivedServerIds = new Set<string>();

      // Batch all writes for this table
      await database.write(async () => {
        const collection = database.get(table);

        for (const pbRec of records) {
          const raw = pbRec as unknown as Record<string, unknown>;
          const local = pbRecordToLocal(table, raw);
          const serverId = local.server_id as string;
          receivedServerIds.add(serverId);

          const existingRec = serverIdToLocal.get(serverId);

          if (existingRec) {
            // Update existing
            await existingRec.update(() => {
              const existingRaw = existingRec._raw as Record<string, unknown>;
              for (const [key, value] of Object.entries(local)) {
                if (key !== "id") {
                  existingRaw[key] = value;
                }
              }
            });
          } else {
            // Create new
            await collection.create((rec) => {
              const newRaw = rec._raw as Record<string, unknown>;
              for (const [key, value] of Object.entries(local)) {
                if (key !== "id") {
                  newRaw[key] = value;
                }
              }
            });
          }
        }

        // Delete local records that no longer exist on the server
        for (const [sid, rec] of serverIdToLocal) {
          if (!receivedServerIds.has(sid)) {
            await rec.destroyPermanently();
          }
        }
      });

      // Prune old location_history records from the server
      if (table === "location_history" && cutoffISO) {
        try {
          const stale = await pb.collection(collectionName).getFullList({
            filter: `timestamp < "${cutoffISO}"`,
          });
          for (const rec of stale) {
            await pb.collection(collectionName).delete(rec.id);
          }
          if (stale.length > 0) {
            logger.info(`Pruned ${stale.length} old location_history record(s) from server`, {
              component: "sync",
            });
          }
        } catch (pruneErr) {
          logger.warn("Failed to prune old location_history from server", {
            component: "sync",
            error: pruneErr instanceof Error ? pruneErr.message : String(pruneErr),
          });
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to pull ${collectionName}`, {
        component: "sync",
        collection: collectionName,
        error: msg,
      });
      // Surface sync failures visibly during development so they aren't silently swallowed
      console.warn(`[sync] Pull failed for ${collectionName}: ${msg}`);
    }
  }
};

// ---------------------------------------------------------------------------
// Public sync function with global lock
// ---------------------------------------------------------------------------

/**
 * Global sync lock.
 * Prevents concurrent pulls. If a sync is already running when a new one
 * is requested, we record that a follow-up is needed and run it once the
 * current one finishes.
 */
let syncInProgress = false;
let syncQueued = false;

export const sync = async (database: Database): Promise<void> => {
  if (syncInProgress) {
    syncQueued = true;
    return;
  }

  syncInProgress = true;

  try {
    const pb = await getPocketBase();
    if (!pb) {
      logger.warn("No PocketBase instance (no server URL?)", { component: "sync" });
      return;
    }
    if (!pb.authStore.isValid) {
      logger.warn("Auth not valid, skipping sync", { component: "sync" });
      return;
    }

    await pullAll(database, pb);
  } catch (error) {
    logger.error("Sync failed", error, { component: "sync" });
  } finally {
    syncInProgress = false;

    if (syncQueued) {
      syncQueued = false;
      sync(database);
    }
  }
};
