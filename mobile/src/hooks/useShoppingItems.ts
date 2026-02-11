import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import type ShoppingItem from "@/db/models/ShoppingItem";
import type ShoppingList from "@/db/models/ShoppingList";

type UseShoppingItemsResult = {
  /** Unchecked items, sorted by sort_order. */
  uncheckedItems: ShoppingItem[];
  /** Checked items, sorted by most recently checked. */
  checkedItems: ShoppingItem[];
  /** The list model itself (observed reactively). */
  list: ShoppingList | null;
  /** Whether the initial load is still in progress. */
  isLoading: boolean;
  /** Add a new item to the list. */
  addItem: (fields: { name: string; quantity?: string; note?: string }) => Promise<ShoppingItem>;
  /** Toggle checked state on an item. */
  toggleItem: (item: ShoppingItem) => Promise<void>;
  /** Delete an item (mark as deleted for sync). */
  deleteItem: (item: ShoppingItem) => Promise<void>;
  /** Update item details. */
  updateItem: (
    item: ShoppingItem,
    fields: { name?: string; quantity?: string; note?: string },
  ) => Promise<void>;
};

/**
 * Reactively observes items for a given shopping list.
 *
 * @param listId - The WatermelonDB local ID of the shopping list.
 */
export const useShoppingItems = (listId: string): UseShoppingItemsResult => {
  const database = useDatabase();
  const { user } = useAuth();
  const [uncheckedItems, setUncheckedItems] = useState<ShoppingItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<ShoppingItem[]>([]);
  const [list, setList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Observe the list itself
  useEffect(() => {
    if (!listId) return;

    let cancelled = false;
    const collection = database.get<ShoppingList>("shopping_lists");

    collection
      .find(listId)
      .then((found) => {
        if (cancelled) return;
        const subscription = found.observe().subscribe({
          next: (record) => setList(record),
          error: (err) => console.warn("[useShoppingItems] List observe error:", err),
        });
        // Store unsubscribe for cleanup
        cleanupRef = () => subscription.unsubscribe();
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("[useShoppingItems] List not found:", err);
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

    const collection = database.get<ShoppingItem>("shopping_items");
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
        console.warn("[useShoppingItems] Unchecked items error:", err);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [database, listId]);

  // Observe checked items
  useEffect(() => {
    if (!listId) return;

    const collection = database.get<ShoppingItem>("shopping_items");
    const query = collection.query(
      Q.where("list_id", listId),
      Q.where("is_checked", true),
      Q.sortBy("updated_at", Q.desc),
    );

    const subscription = query.observe().subscribe({
      next: (results) => setCheckedItems(results),
      error: (err) => console.warn("[useShoppingItems] Checked items error:", err),
    });

    return () => subscription.unsubscribe();
  }, [database, listId]);

  const addItem = async (fields: {
    name: string;
    quantity?: string;
    note?: string;
  }): Promise<ShoppingItem> => {
    const collection = database.get<ShoppingItem>("shopping_items");

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

  const toggleItem = async (item: ShoppingItem): Promise<void> => {
    await item.toggleChecked(user?.id ?? "");
  };

  const deleteItem = async (item: ShoppingItem): Promise<void> => {
    await item.markDeleted();
  };

  const updateItem = async (
    item: ShoppingItem,
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
