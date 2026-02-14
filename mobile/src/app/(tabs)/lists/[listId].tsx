import { router, useLocalSearchParams } from "expo-router";
import { Archive, Check, Pencil, Trash2 } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { DefaultText } from "@/components/DefaultText";
import { Header } from "@/components/Navigation/Header";
import { SmallText } from "@/components/SmallText";
import type ListItem from "@/db/models/ListItem";
import { useListItems } from "@/hooks/useListItems";
import { useLists } from "@/hooks/useLists";
import { useSync } from "@/hooks/useSync";

/** Swipeable item row with check toggle and delete. */
function ItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: ListItem;
  onToggle: (item: ListItem) => void;
  onDelete: (item: ListItem) => void;
}) {
  const { theme } = useUnistyles();
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const opacity = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <Animated.View style={[styles.deleteAction, { opacity }]}>
        <Pressable
          style={styles.deleteActionInner}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(item);
          }}
        >
          <Trash2 size={20} color={theme.colors.white} />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <Pressable style={styles.itemRow} onPress={() => onToggle(item)}>
        <View
          style={[
            styles.checkbox,
            item.isChecked && {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          {item.isChecked && <Check size={14} color={theme.colors.white} />}
        </View>
        <View style={styles.itemContent}>
          <DefaultText
            text={item.name}
            additionalStyles={
              item.isChecked
                ? {
                    textDecorationLine: "line-through",
                    color: theme.colors.grey,
                  }
                : undefined
            }
          />
          {(item.quantity || item.note) && (
            <SmallText text={[item.quantity, item.note].filter(Boolean).join(" - ")} />
          )}
        </View>
      </Pressable>
    </Swipeable>
  );
}

export default function ListDetailScreen() {
  const { theme } = useUnistyles();
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { isSyncing, triggerSync } = useSync();
  const { archiveList, deleteList, renameList } = useLists();

  const { uncheckedItems, checkedItems, list, isLoading, addItem, toggleItem, deleteItem } =
    useListItems(listId);

  // New item input state
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const inputRef = useRef<TextInput>(null);

  // Rename state
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // Get header color based on list type
  const getHeaderColor = () => {
    if (!list) return "#dad4fc"; // purple default
    switch (list.listType) {
      case "shopping":
        return "#b4dbfa"; // blue
      case "todo":
      case "packing":
        return "#dad4fc"; // purple
      case "custom":
        return "#f8d5f4"; // pink
      default:
        return "#dad4fc";
    }
  };

  const handleAddItem = useCallback(async () => {
    const name = newItemName.trim();
    if (!name) return;

    try {
      await addItem({
        name,
        quantity: newItemQuantity.trim() || undefined,
      });
      setNewItemName("");
      setNewItemQuantity("");
      // Keep focus on the input for rapid entry
      inputRef.current?.focus();
    } catch (error) {
      console.warn("[ListDetail] Add item error:", error);
      Alert.alert("Error", "Failed to add item.");
    }
  }, [newItemName, newItemQuantity, addItem]);

  const handleToggle = useCallback(
    (item: ListItem) => {
      toggleItem(item);
    },
    [toggleItem],
  );

  const handleDelete = useCallback(
    (item: ListItem) => {
      Alert.alert("Delete Item", `Remove "${item.name}" from the list?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteItem(item),
        },
      ]);
    },
    [deleteItem],
  );

  const handleArchive = useCallback(() => {
    if (!list || !listId) return;

    const archiveLabel = list.listType === "shopping" ? "Complete Shopping" : "Mark Complete";
    const archiveDescription =
      list.listType === "shopping"
        ? "This will archive the list. You can find it later in archived lists."
        : "This will mark the list as complete and archive it.";

    Alert.alert(archiveLabel, archiveDescription, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          try {
            await archiveList(listId);
            router.back();
          } catch (error) {
            console.warn("[ListDetail] Archive error:", error);
            Alert.alert("Error", "Failed to archive list.");
          }
        },
      },
    ]);
  }, [list, listId, archiveList]);

  const handleDeleteList = useCallback(() => {
    if (!list || !listId) return;

    Alert.alert("Delete List", `Delete "${list.name}" and all its items?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteList(listId);
            router.back();
          } catch (error) {
            console.warn("[ListDetail] Delete error:", error);
            Alert.alert("Error", "Failed to delete list.");
          }
        },
      },
    ]);
  }, [list, listId, deleteList]);

  const handleStartRename = useCallback(() => {
    if (!list) return;
    setRenameValue(list.name);
    setIsRenaming(true);
  }, [list]);

  const handleSubmitRename = useCallback(async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || !list || !listId) {
      setIsRenaming(false);
      return;
    }
    try {
      await renameList(listId, trimmed);
    } catch (error) {
      console.warn("[ListDetail] Rename error:", error);
      Alert.alert("Error", "Failed to rename list.");
    }
    setIsRenaming(false);
  }, [renameValue, list, listId, renameList]);

  if (isLoading || !list) {
    return (
      <View style={styles.outerContainer}>
        <Header title="Loading..." showBack backgroundColor="#dad4fc" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  const archiveLabel = list.listType === "shopping" ? "Complete Shopping" : "Mark Complete";

  return (
    <View style={styles.outerContainer}>
      <Header title={list.name} showBack backgroundColor={getHeaderColor()} />
      <GestureHandlerRootView style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isSyncing}
              onRefresh={triggerSync}
              tintColor={theme.colors.primary}
            />
          }
        >
        {/* Rename input (shown inline when renaming) */}
        {isRenaming && (
          <View style={styles.renameCard}>
            <TextInput
              style={styles.renameInput}
              value={renameValue}
              onChangeText={setRenameValue}
              onSubmitEditing={handleSubmitRename}
              autoFocus
              returnKeyType="done"
              selectTextOnFocus
            />
            <View style={styles.renameActions}>
              <Pressable onPress={() => setIsRenaming(false)}>
                <SmallText text="Cancel" />
              </Pressable>
              <Pressable onPress={handleSubmitRename}>
                <DefaultText
                  text="Save"
                  additionalStyles={{ color: theme.colors.primary, fontWeight: "600" }}
                />
              </Pressable>
            </View>
          </View>
        )}

        {/* Add item input */}
        <View style={styles.addItemCard}>
          <View style={styles.addItemRow}>
            <TextInput
              ref={inputRef}
              style={styles.addItemInput}
              placeholder="Add an item..."
              placeholderTextColor={theme.colors.grey}
              value={newItemName}
              onChangeText={setNewItemName}
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            <TextInput
              style={styles.addItemQuantity}
              placeholder="Qty"
              placeholderTextColor={theme.colors.grey}
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
              keyboardType="default"
            />
          </View>
        </View>

        {/* Active items */}
        {uncheckedItems.length > 0 && (
          <View style={styles.section}>
            {uncheckedItems.map((item) => (
              <ItemRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </View>
        )}

        {/* Checked items */}
        {checkedItems.length > 0 && (
          <View style={styles.section}>
            <SmallText text={`Checked (${checkedItems.length})`} />
            {checkedItems.map((item) => (
              <ItemRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </View>
        )}

        {/* Empty state */}
        {uncheckedItems.length === 0 && checkedItems.length === 0 && (
          <View style={styles.emptyState}>
            <DefaultText text="No items yet" additionalStyles={{ color: theme.colors.grey }} />
            <SmallText text="Type above to add your first item" />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={handleStartRename}>
            <Pencil size={18} color={theme.colors.primary} />
            <DefaultText text="Rename List" additionalStyles={{ color: theme.colors.primary }} />
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleArchive}>
            <Archive size={18} color={theme.colors.primary} />
            <DefaultText text={archiveLabel} additionalStyles={{ color: theme.colors.primary }} />
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleDeleteList}>
            <Trash2 size={18} color={theme.colors.error} />
            <DefaultText text="Delete List" additionalStyles={{ color: theme.colors.error }} />
          </Pressable>
        </View>
      </ScrollView>
      </GestureHandlerRootView>
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
    gap: theme.spacing[4],
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  renameCard: {
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
  renameInput: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    paddingVertical: theme.spacing[2],
  },
  renameActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing[4],
    alignItems: "center",
  },
  addItemCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[3],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  addItemRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  addItemInput: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography,
    paddingVertical: theme.spacing[2],
  },
  addItemQuantity: {
    width: 60,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography,
    paddingVertical: theme.spacing[2],
    textAlign: "center",
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.greyLight,
  },
  section: {
    gap: 0,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.greyLight,
    gap: theme.spacing[3],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.greySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  deleteAction: {
    backgroundColor: theme.colors.error,
    justifyContent: "center",
    alignItems: "flex-end",
    width: 80,
  },
  deleteActionInner: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing[7],
    gap: 4,
  },
  actions: {
    marginTop: theme.spacing[4],
    gap: theme.spacing[2],
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
  },
}));
