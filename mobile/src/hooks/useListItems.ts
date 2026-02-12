import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import type List from "@/db/models/List";
import type ListItem from "@/db/models/ListItem";
import { upsertRecord, deleteRecordByServerId } from "@/db/sync";

type UseListItemsResult = {
  /** Unchecked items, sorted by sort_order. */
  uncheckedItems: ListItem[];
  /** Checked items, sorted by most recently checked. */
  checkedItems: ListItem[];
  /** The list model itself (observed reactively). */
  list: List | null;
  /** Whether the initial load is still in progress. */
  isLoading: boolean;
  /** Add a new item to the list. */
  addItem: (fields: { name: string; quantity?: string; note?: string }) => Promise<void>;
  /** Toggle checked state on an item. */
  toggleItem: (item: ListItem) => Promise<void>;
  /** Delete an item. */
  deleteItem: (item: ListItem) => Promise<void>;
  /** Update item details. */
  updateItem: (
    item: ListItem,
    fields: { name?: string; quantity?: string; note?: string },
  ) => Promise<void>;
};

/**
 * Reactively observes items for a given list.
 *
 * Mutations go to PocketBase first, then upsert the result into WatermelonDB.
 * All relation fields (list_id, checked_by, created_by) store PB server IDs.
 *
 * @param listServerId - The PocketBase server ID of the list.
 */
export const useListItems = (listServerId: string | undefined): UseListItemsResult => {
  const database = useDatabase();
  const { user, pb } = useAuth();
  const [uncheckedItems, setUncheckedItems] = useState<ListItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<ListItem[]>([]);
  const [list, setList] = useState<List | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Observe the list itself (looked up by server_id, not WMDB id)
  useEffect(() => {
    if (!listServerId) return;

    const collection = database.get<List>("lists");
    const query = collection.query(Q.where("server_id", listServerId));

    const subscription = query.observe().subscribe({
      next: (results) => {
        setList(results.length > 0 ? results[0] : null);
      },
      error: (err) => {
        console.warn("[useListItems] List observe error:", err);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [database, listServerId]);

  // Observe unchecked items (list_id stores PB server ID)
  useEffect(() => {
    if (!listServerId) return;

    const collection = database.get<ListItem>("list_items");
    const query = collection.query(
      Q.where("list_id", listServerId),
      Q.where("is_checked", false),
      Q.sortBy("sort_order", Q.asc),
    );

    const subscription = query.observe().subscribe({
      next: (results) => {
        setUncheckedItems(results);
        setIsLoading(false);
      },
      error: (err) => {
        console.warn("[useListItems] Unchecked items error:", err);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [database, listServerId]);

  // Observe checked items
  useEffect(() => {
    if (!listServerId) return;

    const collection = database.get<ListItem>("list_items");
    const query = collection.query(
      Q.where("list_id", listServerId),
      Q.where("is_checked", true),
      Q.sortBy("updated_at", Q.desc),
    );

    const subscription = query.observe().subscribe({
      next: (results) => setCheckedItems(results),
      error: (err) => console.warn("[useListItems] Checked items error:", err),
    });

    return () => subscription.unsubscribe();
  }, [database, listServerId]);

  const addItem = async (fields: {
    name: string;
    quantity?: string;
    note?: string;
  }): Promise<void> => {
    if (!listServerId) throw new Error("No list ID");
    if (!pb) throw new Error("PocketBase not available.");

    // 1. Create on PocketBase first
    const pbRecord = await pb.collection("list_items").create({
      list_id: listServerId,
      name: fields.name,
      quantity: fields.quantity ?? "",
      note: fields.note ?? "",
      checked: false,
      sort_order: uncheckedItems.length,
      created_by: user?.id ?? "",
    });

    // 2. Upsert into local WMDB cache
    await upsertRecord(database, "list_items", pbRecord as unknown as Record<string, unknown>);
  };

  const toggleItem = async (item: ListItem): Promise<void> => {
    if (!pb) throw new Error("PocketBase not available.");

    const serverId = item.serverId;
    if (!serverId) throw new Error("Item has no server_id — cannot update on PB.");

    const newChecked = !item.isChecked;

    // 1. Update on PocketBase first
    const pbRecord = await pb.collection("list_items").update(serverId, {
      checked: newChecked,
      checked_by: newChecked ? (user?.id ?? "") : "",
    });

    // 2. Upsert into local WMDB cache
    await upsertRecord(database, "list_items", pbRecord as unknown as Record<string, unknown>);
  };

  const deleteItem = async (item: ListItem): Promise<void> => {
    if (!pb) throw new Error("PocketBase not available.");

    const serverId = item.serverId;
    if (!serverId) throw new Error("Item has no server_id — cannot delete on PB.");

    // 1. Delete on PocketBase first
    await pb.collection("list_items").delete(serverId);

    // 2. Remove from local WMDB cache
    await deleteRecordByServerId(database, "list_items", serverId);
  };

  const updateItem = async (
    item: ListItem,
    fields: { name?: string; quantity?: string; note?: string },
  ): Promise<void> => {
    if (!pb) throw new Error("PocketBase not available.");

    const serverId = item.serverId;
    if (!serverId) throw new Error("Item has no server_id — cannot update on PB.");

    // 1. Update on PocketBase first
    const pbRecord = await pb.collection("list_items").update(serverId, fields);

    // 2. Upsert into local WMDB cache
    await upsertRecord(database, "list_items", pbRecord as unknown as Record<string, unknown>);
  };

  return {
    uncheckedItems,
    checkedItems,
    list,
    isLoading,
    addItem,
    toggleItem,
    deleteItem,
    updateItem,
  };
};
