import { router } from "expo-router";
import { CookingPot, Clock, Plus, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { useRecipes } from "@/hooks/useRecipes";
import { useSync } from "@/hooks/useSync";

export default function RecipesScreen() {
  const { theme } = useUnistyles();
  const { recipes, isLoading } = useRecipes();
  const { isSyncing, triggerSync } = useSync();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const recipe of recipes) {
      for (const tag of recipe.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch =
        !searchQuery || recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !activeTag || recipe.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [recipes, searchQuery, activeTag]);

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
        title="Recipes"
        backgroundColor="#b2ecca"
        rightElement={
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/recipe/create")}
            hitSlop={8}
          >
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.grey} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor={theme.colors.grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        {/* Tag Filter Chips */}
        {allTags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
          >
            {allTags.map((tag) => (
              <Pressable
                key={tag}
                style={[styles.tagChip, activeTag === tag && styles.tagChipActive]}
                onPress={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                <SmallText text={tag} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Empty state */}
        {recipes.length === 0 && (
          <View style={styles.emptyState}>
            <CookingPot size={48} color={theme.colors.grey} />
            <DefaultText
              text="No recipes yet"
              additionalStyles={{ color: theme.colors.grey, marginTop: 12 }}
            />
            <DefaultText
              text="Tap + to add your first recipe"
              additionalStyles={{ color: theme.colors.grey }}
            />
          </View>
        )}

        {/* No results */}
        {recipes.length > 0 && filteredRecipes.length === 0 && (
          <View style={styles.emptyState}>
            <Search size={48} color={theme.colors.grey} />
            <DefaultText
              text="No matching recipes"
              additionalStyles={{ color: theme.colors.grey, marginTop: 12 }}
            />
          </View>
        )}

        {/* Recipe cards */}
        {filteredRecipes.map((recipe) => (
          <Pressable
            key={recipe.id}
            style={styles.recipeCard}
            onPress={() =>
              router.push({
                pathname: "/recipe/[id]",
                params: { id: recipe.serverId },
              })
            }
          >
            <View style={styles.cardContent}>
              {/* Thumbnail placeholder */}
              <View style={styles.thumbnail}>
                <CookingPot size={24} color={theme.colors.white} />
              </View>

              <View style={styles.cardDetails}>
                <DefaultText
                  text={recipe.title}
                  additionalStyles={{ fontWeight: "600", fontSize: theme.fontSizes.md }}
                />

                {recipe.tags.length > 0 && (
                  <View style={styles.cardTags}>
                    {recipe.tags.slice(0, 3).map((tag) => (
                      <View key={tag} style={styles.miniTag}>
                        <SmallText text={tag} />
                      </View>
                    ))}
                    {recipe.tags.length > 3 && (
                      <SmallText text={`+${recipe.tags.length - 3}`} />
                    )}
                  </View>
                )}

                {(recipe.cookTime > 0 || recipe.totalTime > 0) && (
                  <View style={styles.metaRow}>
                    <Clock size={14} color={theme.colors.grey} />
                    <SmallText
                      text={`${recipe.totalTime || recipe.cookTime} min`}
                    />
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.greyBackground,
    borderRadius: theme.borderRadiusXs,
    paddingHorizontal: theme.spacing[4],
    height: theme.inputHeight,
    gap: theme.spacing[2],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    borderWidth: 2,
    borderColor: theme.colors.black,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography,
  },
  tagsContainer: {
    gap: theme.spacing[2],
  },
  tagChip: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadiusXs,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.greyLight,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  tagChipActive: {
    backgroundColor: "#b2ecca",
    borderWidth: 2,
    borderColor: theme.colors.black,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing[8],
    gap: 4,
  },
  recipeCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[3],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    borderWidth: 2,
    borderColor: theme.colors.black,
  },
  cardContent: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#b2ecca",
    justifyContent: "center",
    alignItems: "center",
  },
  cardDetails: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  cardTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  miniTag: {
    backgroundColor: theme.colors.greyBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
}));
