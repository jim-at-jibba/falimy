import { Q } from "@nozbe/watermelondb";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import type List from "@/db/models/List";
import type { ListStatus, ListType } from "@/db/models/List";
import { upsertRecord, deleteRecordByServerId } from "@/db/sync";

type UseListsResult = {
  /** Active lists for the user's family. */
  lists: List[];
  /** Whether the initial load is still in progress. */
  isLoading: boolean;
  /** Create a new list. Returns the created list's PB server ID. */
  createList: (name: string, type?: ListType) => Promise<string>;
  /** Archive a list (set status to "archived" on PB, then upsert locally). */
  archiveList: (serverId: string) => Promise<void>;
  /** Delete a list on PB and remove locally. */
  deleteList: (serverId: string) => Promise<void>;
  /** Rename a list on PB and upsert locally. */
  renameList: (serverId: string, newName: string) => Promise<void>;
};

/**
 * Reactively observes lists for the current user's family.
 *
 * Mutations go to PocketBase first, then upsert the result into WatermelonDB.
 * All relation fields store PB server IDs.
 *
 * @param statusFilter - Filter by list status. Defaults to showing "active" and "completed".
 */
export const useLists = (statusFilter: ListStatus[] = ["active", "completed"]): UseListsResult => {
  const database = useDatabase();
  const { user, pb } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stabilize the filter array so it can be used as an effect dependency
  // biome-ignore lint/correctness/useExhaustiveDependencies: stabilize array reference by value
  const stableFilter = useMemo(() => statusFilter, [statusFilter.join(",")]);

  useEffect(() => {
    if (!user?.family_id) {
      setLists([]);
      setIsLoading(false);
      return;
    }

    const collection = database.get<List>("lists");
    const query = collection.query(
      Q.where("family_id", user.family_id),
      Q.where("status", Q.oneOf(stableFilter)),
      Q.sortBy("sort_order", Q.asc),
      Q.sortBy("updated_at", Q.desc),
    );

    const subscription = query.observe().subscribe({
      next: (results) => {
        setLists(results);
        setIsLoading(false);
      },
      error: (error) => {
        console.warn("[useLists] Observe error:", error);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [database, user?.family_id, stableFilter]);

  const createList = async (name: string, type: ListType = "shopping"): Promise<string> => {
    if (!user?.family_id) {
      throw new Error("Cannot create list: no family_id. Please log in and join a family first.");
    }
    if (!pb) {
      throw new Error("Cannot create list: PocketBase not available.");
    }

    // 1. Create on PocketBase first (source of truth)
    const pbRecord = await pb.collection("lists").create({
      name,
      type,
      family_id: user.family_id,
      created_by: user.id,
      status: "active",
      sort_order: 0,
    });

    // 2. Upsert the PB response into local WMDB cache
    await upsertRecord(database, "lists", pbRecord as unknown as Record<string, unknown>);

    return pbRecord.id;
  };

  const archiveList = async (serverId: string): Promise<void> => {
    if (!pb) throw new Error("PocketBase not available.");

    const pbRecord = await pb.collection("lists").update(serverId, {
      status: "archived",
    });
    await upsertRecord(database, "lists", pbRecord as unknown as Record<string, unknown>);
  };

  const deleteList = async (serverId: string): Promise<void> => {
    if (!pb) throw new Error("PocketBase not available.");

    await pb.collection("lists").delete(serverId);
    await deleteRecordByServerId(database, "lists", serverId);
    // Also delete local list items for this list
    // (PB cascade-deletes them, but we need to clean up locally)
    const localItems = await database
      .get("list_items")
      .query(Q.where("list_id", serverId))
      .fetch();
    if (localItems.length > 0) {
      await database.write(async () => {
        for (const item of localItems) {
          await item.destroyPermanently();
        }
      });
    }
  };

  const renameList = async (serverId: string, newName: string): Promise<void> => {
    if (!pb) throw new Error("PocketBase not available.");

    const pbRecord = await pb.collection("lists").update(serverId, {
      name: newName,
    });
    await upsertRecord(database, "lists", pbRecord as unknown as Record<string, unknown>);
  };

  return { lists, isLoading, createList, archiveList, deleteList, renameList };
};
