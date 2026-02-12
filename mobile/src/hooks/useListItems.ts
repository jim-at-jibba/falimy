import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import type List from "@/db/models/List";
import type ListItem from "@/db/models/ListItem";

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
  addItem: (fields: { name: string; quantity?: string; note?: string }) => Promise<ListItem>;
  /** Toggle checked state on an item. */
  toggleItem: (item: ListItem) => Promise<void>;
  /** Delete an item (mark as deleted for sync). */
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
 * @param listId - The WatermelonDB local ID of the list.
 */
export const useListItems = (listId: string): UseListItemsResult => {
  const database = useDatabase();
  const { user } = useAuth();
  const [uncheckedItems, setUncheckedItems] = useState<ListItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<ListItem[]>([]);
  const [list, setList] = useState<List | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Observe the list itself
  useEffect(() => {
    if (!listId) return;

    let cancelled = false;
    const collection = database.get<List>("lists");

    collection
      .find(listId)
      .then((found) => {
        if (cancelled) return;
        const subscription = found.observe().subscribe({
          next: (record) => setList(record),
          error: (err) => console.warn("[useListItems] List observe error:", err),
        });
        // Store unsubscribe for cleanup
        cleanupRef = () => subscription.unsubscribe();
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("[useListItems] List not found:", err);
          setIsLoading(false);
        }
      });

    let cleanupRef: (() => void) | null = null;
    return () => {
      cancelled = true;
      cleanupRef?.();
    };
  }, [database, listId]);

  // Observe unchecked items
  useEffect(() => {
    if (!listId) return;

    const collection = database.get<ListItem>("list_items");
    const query = collection.query(
      Q.where("list_id", listId),
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
  }, [database, listId]);

  // Observe checked items
  useEffect(() => {
    if (!listId) return;

    const collection = database.get<ListItem>("list_items");
    const query = collection.query(
      Q.where("list_id", listId),
      Q.where("is_checked", true),
      Q.sortBy("updated_at", Q.desc),
    );

    const subscription = query.observe().subscribe({
      next: (results) => setCheckedItems(results),
      error: (err) => console.warn("[useListItems] Checked items error:", err),
    });

    return () => subscription.unsubscribe();
  }, [database, listId]);

  const addItem = async (fields: {
    name: string;
    quantity?: string;
    note?: string;
  }): Promise<ListItem> => {
    const collection = database.get<ListItem>("list_items");

    const newItem = await database.write(async () => {
      return collection.create((item) => {
        item.listId = listId;
        item.name = fields.name;
        item.quantity = fields.quantity ?? null;
        item.note = fields.note ?? null;
        item.isChecked = false;
        item.checkedById = null;
        item.sortOrder = uncheckedItems.length;
        item.createdById = user?.id ?? null;
      });
    });

    return newItem;
  };

  const toggleItem = async (item: ListItem): Promise<void> => {
    await item.toggleChecked(user?.id ?? "");
  };

  const deleteItem = async (item: ListItem): Promise<void> => {
    await item.markDeleted();
  };

  const updateItem = async (
    item: ListItem,
    fields: { name?: string; quantity?: string; note?: string },
  ): Promise<void> => {
    await item.updateDetails(fields);
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
