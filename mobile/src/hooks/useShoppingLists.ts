import { Q } from "@nozbe/watermelondb";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import type ShoppingList from "@/db/models/ShoppingList";
import type { ListStatus } from "@/db/models/ShoppingList";

type UseShoppingListsResult = {
  /** Active shopping lists for the user's family. */
  lists: ShoppingList[];
  /** Whether the initial load is still in progress. */
  isLoading: boolean;
  /** Create a new shopping list. Returns the created list. */
  createList: (name: string) => Promise<ShoppingList>;
};

/**
 * Reactively observes shopping lists for the current user's family.
 *
 * @param statusFilter - Filter by list status. Defaults to showing "active" and "completed".
 */
export const useShoppingLists = (
  statusFilter: ListStatus[] = ["active", "completed"],
): UseShoppingListsResult => {
  const database = useDatabase();
  const { user } = useAuth();
  const [lists, setLists] = useState<ShoppingList[]>([]);
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

    const collection = database.get<ShoppingList>("shopping_lists");
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
        console.warn("[useShoppingLists] Observe error:", error);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [database, user?.family_id, stableFilter]);

  const createList = async (name: string): Promise<ShoppingList> => {
    if (!user?.family_id) {
      throw new Error("Cannot create list: no family_id. Please log in and join a family first.");
    }

    const collection = database.get<ShoppingList>("shopping_lists");

    const newList = await database.write(async () => {
      return collection.create((list) => {
        list.name = name;
        list.familyId = user.family_id as string;
        list.createdById = user.id;
        list.status = "active";
        list.sortOrder = 0;
      });
    });

    return newList;
  };

  return { lists, isLoading, createList };
};
