import { Q } from "@nozbe/watermelondb";
import { router } from "expo-router";
import { List as ListIcon, Plus } from "lucide-react-native";
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
import { Header } from "@/components/Navigation/Header";
import { SmallText } from "@/components/SmallText";
import { useDatabase } from "@/contexts/DatabaseContext";
import type List from "@/db/models/List";
import type { ListType } from "@/db/models/List";
import type ListItem from "@/db/models/ListItem";
import { useLists } from "@/hooks/useLists";
import { useSync } from "@/hooks/useSync";

/** Color mapping for list types */
const LIST_TYPE_COLORS: Record<ListType, string> = {
  shopping: "#b4dbfa", // blue
  todo: "#dad4fc", // purple
  packing: "#fadeaf", // orange
  custom: "#f8d5f4", // pink
};

/** Small sub-component to display live item counts for a list. */
function ListItemCounts({ list }: { list: List }) {
  const database = useDatabase();
  const [totalCount, setTotalCount] = useState(0);
  const [checkedCount, setCheckedCount] = useState(0);

  useEffect(() => {
    const collection = database.get<ListItem>("list_items");

    const totalSub = collection
      .query(Q.where("list_id", list.serverId))
      .observeCount()
      .subscribe((count) => setTotalCount(count));

    const checkedSub = collection
      .query(Q.where("list_id", list.serverId), Q.where("is_checked", true))
      .observeCount()
      .subscribe((count) => setCheckedCount(count));

    return () => {
      totalSub.unsubscribe();
      checkedSub.unsubscribe();
    };
  }, [database, list.serverId]);

  if (totalCount === 0) {
    return <SmallText text="No items" />;
  }

  return <SmallText text={`${checkedCount}/${totalCount} items checked`} />;
}

export default function ListsScreen() {
  const { theme } = useUnistyles();
  const { lists, isLoading, createList } = useLists();
  const { isSyncing, triggerSync } = useSync();
  const [showNewInput, setShowNewInput] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListType, setNewListType] = useState<ListType>("shopping");

  const handleCreateList = useCallback(async () => {
    const name = newListName.trim();
    if (!name) return;

    try {
      await createList(name, newListType);
      setNewListName("");
      setNewListType("shopping");
      setShowNewInput(false);
    } catch (error) {
      console.warn("[Lists] Create error:", error);
      const message = error instanceof Error ? error.message : "Failed to create list.";
      Alert.alert("Error", message);
    }
  }, [newListName, newListType, createList]);

  const handleOpenList = useCallback((list: List) => {
    router.push({
      pathname: "/(tabs)/lists/[listId]" as const,
      params: { listId: list.serverId },
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
    <View style={styles.outerContainer}>
      <Header
        title="Lists"
        backgroundColor="#dad4fc"
        rightElement={
          <Pressable style={styles.addButton} onPress={() => setShowNewInput(true)} hitSlop={8}>
            <Plus size={24} color={theme.colors.backgroundAccent} />
          </Pressable>
        }
      />
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
          
          {/* List type selector */}
          <View style={styles.typeSelector}>
            <SmallText text="Type:" />
            <View style={styles.typeButtons}>
              <Pressable
                style={[
                  styles.typeButton,
                  { backgroundColor: LIST_TYPE_COLORS.shopping },
                  newListType === "shopping" && styles.typeButtonActive,
                ]}
                onPress={() => setNewListType("shopping")}
              >
                <SmallText text="🛒" />
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  { backgroundColor: LIST_TYPE_COLORS.todo },
                  newListType === "todo" && styles.typeButtonActive,
                ]}
                onPress={() => setNewListType("todo")}
              >
                <SmallText text="✓" />
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  { backgroundColor: LIST_TYPE_COLORS.packing },
                  newListType === "packing" && styles.typeButtonActive,
                ]}
                onPress={() => setNewListType("packing")}
              >
                <SmallText text="🎒" />
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  { backgroundColor: LIST_TYPE_COLORS.custom },
                  newListType === "custom" && styles.typeButtonActive,
                ]}
                onPress={() => setNewListType("custom")}
              >
                <SmallText text="⭐" />
              </Pressable>
            </View>
          </View>

          <View style={styles.newListActions}>
            <Pressable
              onPress={() => {
                setShowNewInput(false);
                setNewListName("");
                setNewListType("shopping");
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
          <ListIcon size={48} color={theme.colors.grey} />
          <DefaultText
            text="No lists yet"
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
        <Pressable 
          key={list.id} 
          style={[
            styles.listCard, 
            { backgroundColor: LIST_TYPE_COLORS[list.listType] }
          ]} 
          onPress={() => handleOpenList(list)}
        >
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
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accentLight,
    justifyContent: "center",
    alignItems: "center",
  },
  newListCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[4],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    gap: theme.spacing[3],
    borderWidth: 3,
    borderColor: "#b4dbfa", // blue
  },
  newListInput: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography,
    backgroundColor: theme.colors.greyBackground,
    borderRadius: theme.borderRadiusXs,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    height: theme.inputHeight,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  newListActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing[4],
    alignItems: "center",
  },
  typeSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  typeButtons: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  typeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  typeButtonActive: {
    borderWidth: 3,
    borderColor: theme.colors.black,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing[8],
    gap: 4,
  },
  listCard: {
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[4],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
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
