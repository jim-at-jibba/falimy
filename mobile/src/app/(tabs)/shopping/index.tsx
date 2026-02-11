import { Q } from "@nozbe/watermelondb";
import { router } from "expo-router";
import { Plus, ShoppingCart } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { DefaultText } from "@/components/DefaultText";
import { SmallText } from "@/components/SmallText";
import Title from "@/components/Title";
import { useDatabase } from "@/contexts/DatabaseContext";
import type ShoppingItem from "@/db/models/ShoppingItem";
import type ShoppingList from "@/db/models/ShoppingList";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { useSync } from "@/hooks/useSync";

/** Small sub-component to display live item counts for a list. */
function ListItemCounts({ list }: { list: ShoppingList }) {
  const database = useDatabase();
  const [totalCount, setTotalCount] = useState(0);
  const [checkedCount, setCheckedCount] = useState(0);

  useEffect(() => {
    const collection = database.get<ShoppingItem>("shopping_items");

    const totalSub = collection
      .query(Q.where("list_id", list.id))
      .observeCount()
      .subscribe((count) => setTotalCount(count));

    const checkedSub = collection
      .query(Q.where("list_id", list.id), Q.where("is_checked", true))
      .observeCount()
      .subscribe((count) => setCheckedCount(count));

    return () => {
      totalSub.unsubscribe();
      checkedSub.unsubscribe();
    };
  }, [database, list.id]);

  if (totalCount === 0) {
    return <SmallText text="No items" />;
  }

  return <SmallText text={`${checkedCount}/${totalCount} items checked`} />;
}

export default function ShoppingListsScreen() {
  const { theme } = useUnistyles();
  const { lists, isLoading, createList } = useShoppingLists();
  const { isSyncing, triggerSync } = useSync();
  const [showNewInput, setShowNewInput] = useState(false);
  const [newListName, setNewListName] = useState("");

  const handleCreateList = useCallback(async () => {
    const name = newListName.trim();
    if (!name) return;

    try {
      await createList(name);
      setNewListName("");
      setShowNewInput(false);
    } catch (error) {
      console.warn("[ShoppingLists] Create error:", error);
      Alert.alert("Error", "Failed to create shopping list.");
    }
  }, [newListName, createList]);

  const handleOpenList = useCallback((list: ShoppingList) => {
    router.push({
      pathname: "/(tabs)/shopping/[listId]" as const,
      params: { listId: list.id },
    } as never);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isSyncing}
          onRefresh={triggerSync}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <Title text="Shopping Lists" />
        <Pressable style={styles.addButton} onPress={() => setShowNewInput(true)} hitSlop={8}>
          <Plus size={24} color={theme.colors.primary} />
        </Pressable>
      </View>

      {/* Create new list input */}
      {showNewInput && (
        <View style={styles.newListCard}>
          <TextInput
            style={styles.newListInput}
            placeholder="List name..."
            placeholderTextColor={theme.colors.grey}
            value={newListName}
            onChangeText={setNewListName}
            onSubmitEditing={handleCreateList}
            autoFocus
            returnKeyType="done"
          />
          <View style={styles.newListActions}>
            <Pressable
              onPress={() => {
                setShowNewInput(false);
                setNewListName("");
              }}
            >
              <SmallText text="Cancel" />
            </Pressable>
            <Pressable onPress={handleCreateList}>
              <DefaultText
                text="Create"
                additionalStyles={{ color: theme.colors.primary, fontWeight: "600" }}
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* Empty state */}
      {lists.length === 0 && !showNewInput && (
        <View style={styles.emptyState}>
          <ShoppingCart size={48} color={theme.colors.grey} />
          <DefaultText
            text="No shopping lists yet"
            additionalStyles={{ color: theme.colors.grey, marginTop: 12 }}
          />
          <DefaultText
            text="Tap + to create your first list"
            additionalStyles={{ color: theme.colors.grey }}
          />
        </View>
      )}

      {/* List cards */}
      {lists.map((list) => (
        <Pressable key={list.id} style={styles.listCard} onPress={() => handleOpenList(list)}>
          <View style={styles.listCardContent}>
            <View style={styles.listCardText}>
              <DefaultText
                text={list.name}
                additionalStyles={{ fontWeight: "600", fontSize: theme.fontSizes.md }}
              />
              <ListItemCounts list={list} />
            </View>
            <View style={styles.listCardMeta}>
              {list.status === "completed" && (
                <View style={styles.statusBadge}>
                  <SmallText text="Done" />
                </View>
              )}
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing[5],
    paddingBottom: 40,
    gap: theme.spacing[3],
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundAccent,
    justifyContent: "center",
    alignItems: "center",
  },
  newListCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[4],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: theme.spacing[3],
  },
  newListInput: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.greyLight,
    paddingVertical: theme.spacing[2],
  },
  newListActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing[4],
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing[8],
    gap: 4,
  },
  listCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[4],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  listCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listCardText: {
    flex: 1,
    gap: 4,
  },
  listCardMeta: {
    marginLeft: theme.spacing[3],
  },
  statusBadge: {
    backgroundColor: theme.colors.successBackground,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    borderRadius: theme.borderRadiusXs,
  },
}));
