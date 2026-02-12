import type { Database } from "@nozbe/watermelondb";
import { synchronize } from "@nozbe/watermelondb/sync";
import type PocketBase from "pocketbase";

import { getPocketBase } from "@/api/pocketbase";
import { Collections } from "@/types/pocketbase-types";

/**
 * Maps WatermelonDB table names to PocketBase collection names.
 * WatermelonDB table "members" maps to PocketBase collection "users" since
 * PocketBase uses a built-in users auth collection.
 */
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
    id: "server_id",
    family_id: "family_id",
    location_sharing_mode: "location_sharing_mode",
    location_sharing_until: "location_sharing_until",
    last_lat: "last_lat",
    last_lng: "last_lng",
    last_location_at: "last_location_at",
  },
  list_items: {
    id: "server_id",
    checked: "is_checked",
    checked_by: "checked_by_id",
    created_by: "created_by_id",
  },
  lists: {
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

/**
 * Maps WMDB relation columns to the local table they reference.
 * Only fields that store a WatermelonDB local ID (rather than an already-
 * resolved PocketBase server ID) need to be listed here.
 *
 * During push, the local WMDB ID stored in these columns will be resolved
 * to the corresponding PocketBase server_id by looking up the referenced
 * record in the local database.
 */
const RELATION_FIELDS: Record<string, Record<string, string>> = {
  list_items: {
    // list_items.list_id stores a local WMDB ID referencing the "lists" table
    list_id: "lists",
  },
};

/** Tables that should be synced. */
const SYNC_TABLES = ["families", "members", "lists", "list_items", "location_history", "geofences"];

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

  // WMDB sync requires an `id` field on every raw record for reconciliation.
  // Use the PocketBase ID so pulled records can be matched to local records.
  raw.id = record.id as string;
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
 * Resolve local WMDB IDs in relation fields to PocketBase server IDs.
 *
 * For each relation field defined in RELATION_FIELDS for the given table,
 * looks up the referenced record in the local database and replaces the
 * local WMDB ID with the record's `server_id`.
 *
 * If the referenced record has no `server_id` yet (i.e. it hasn't been
 * pushed to PocketBase), returns null to signal this record should be
 * skipped for now — it will be retried on the next sync cycle.
 */
const resolveRelationIds = async (
  table: string,
  pbRecord: Record<string, unknown>,
  raw: Record<string, unknown>,
  database: Database,
): Promise<Record<string, unknown> | null> => {
  const relationFields = RELATION_FIELDS[table];
  if (!relationFields) return pbRecord;

  const fieldMap = PB_TO_WMDB_FIELDS[table] ?? {};
  // Build reverse map to find PB field name from WMDB column name
  const reverseMap: Record<string, string> = {};
  for (const [pbKey, wmdbKey] of Object.entries(fieldMap)) {
    reverseMap[wmdbKey] = pbKey;
  }

  const resolved = { ...pbRecord };

  for (const [wmdbColumn, referencedTable] of Object.entries(relationFields)) {
    const localId = raw[wmdbColumn] as string | undefined;
    if (!localId) continue;

    // The PB field name might differ from the WMDB column name
    const pbFieldName = reverseMap[wmdbColumn] ?? wmdbColumn;

    try {
      const referencedRecord = await database.get(referencedTable).find(localId);
      // biome-ignore lint: _raw is the underlying record; server_id is a dynamic column
      const serverId = (referencedRecord._raw as any).server_id as string | undefined;
      console.log(`[Sync] resolveRelation ${table}.${wmdbColumn}: localId=${localId}, serverId=${serverId || "(empty)"}`);

      if (!serverId) {
        // Referenced record hasn't been pushed yet — skip this record.
        // It will be pushed on the next sync cycle after its parent is created.
        console.warn(
          `[Sync] Skipping ${table} record: referenced ${referencedTable} (${localId}) has no server_id yet`,
        );
        return null;
      }

      resolved[pbFieldName] = serverId;
    } catch {
      // Referenced record not found locally — might have been deleted.
      // Let PocketBase handle the validation error.
      console.warn(
        `[Sync] Referenced ${referencedTable} record (${localId}) not found locally for ${table}.${wmdbColumn}`,
      );
    }
  }

  return resolved;
};

/**
 * Push a single record (created or updated) to PocketBase.
 *
 * - For records without a server_id: creates in PB and writes the server_id back locally.
 * - For records with a server_id: updates the existing PB record.
 */
const pushRecord = async (
  pb: PocketBase,
  table: string,
  collection: string,
  raw: Record<string, unknown>,
  database: Database,
): Promise<void> => {
  const pbRecord = rawToPbRecord(table, raw);
  const serverId = raw.server_id as string | undefined;
  const localId = raw.id as string;

  // Resolve any relation fields that store local WMDB IDs
  const resolvedRecord = await resolveRelationIds(table, pbRecord, raw, database);
  if (!resolvedRecord) {
    // A referenced record hasn't been pushed yet — skip for now.
    // It will be pushed on the next sync cycle after its parent is created.
    return;
  }

  if (serverId) {
    // Record already exists on server — update it.
    console.log(`[Sync] Updating ${collection}/${serverId}`);
    await pb.collection(collection).update(serverId, resolvedRecord);
  } else {
    // New local record — create on server and write back the server ID.
    console.log(`[Sync] Creating ${collection} record:`, JSON.stringify(resolvedRecord));
    const created = await pb.collection(collection).create(resolvedRecord);
    console.log(`[Sync] Created ${collection} with server ID: ${created.id}`);
    await database.write(async () => {
      const localRecord = await database.get(table).find(localId);
      await localRecord.update(() => {
        // biome-ignore lint: _raw is the underlying record; server_id is a dynamic column
        (localRecord._raw as any).server_id = created.id;
      });
    });
  }
};

/**
 * Push local changes to PocketBase.
 *
 * WatermelonDB's `fetchLocalChanges` always separates records into `created`,
 * `updated`, and `deleted` arrays. Both `created` and `updated` need to be
 * pushed to the server.
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

    // Push created records (new local records that don't exist on server)
    for (const raw of tableChanges.created) {
      try {
        console.log(`[Sync] Pushing new ${collection} record (id=${raw.id})`);
        await pushRecord(pb, table, collection, raw, database);
      } catch (error) {
        console.warn(`[Sync] Failed to push new ${collection} record (${raw.id}):`, error);
        throw error;
      }
    }

    // Push updated records (existing records that were modified locally)
    for (const raw of tableChanges.updated) {
      try {
        console.log(`[Sync] Pushing updated ${collection} record (id=${raw.id}, server_id=${raw.server_id})`);
        await pushRecord(pb, table, collection, raw, database);
      } catch (error) {
        console.warn(`[Sync] Failed to push updated ${collection} record (${raw.id}):`, error);
        throw error;
      }
    }

    // Handle deleted records
    for (const id of tableChanges.deleted) {
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
 * Global sync lock.
 * WatermelonDB's `synchronize()` throws if called concurrently on the same
 * database. We guard against that at our level so callers don't have to.
 *
 * If a sync is already running when a new one is requested, we record that
 * a follow-up is needed and run it once the current one finishes. This
 * ensures mutations that happen *during* a sync still get pushed promptly.
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
      console.warn("[Sync] No PocketBase instance (no server URL?)");
      return;
    }
    if (!pb.authStore.isValid) {
      console.warn("[Sync] Auth not valid, skipping sync");
      return;
    }

    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt }) => {
        const result = await pullChanges(pb, lastPulledAt ?? null);
        return result;
      },
      pushChanges: async ({ changes }) => {
        // Log what we're about to push
        for (const [table, tableChanges] of Object.entries(changes)) {
          const c = (tableChanges as any).created?.length ?? 0;
          const u = (tableChanges as any).updated?.length ?? 0;
          const d = (tableChanges as any).deleted?.length ?? 0;
          if (c || u || d) {
            console.log(`[Sync] push ${table}: ${c} created, ${u} updated, ${d} deleted`);
          }
        }
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
  } catch (error) {
    console.warn("[Sync] Failed:", error);
  } finally {
    syncInProgress = false;

    if (syncQueued) {
      syncQueued = false;
      sync(database);
    }
  }
};
