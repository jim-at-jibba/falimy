import { router, useLocalSearchParams } from "expo-router";
import { Clock, CookingPot, ExternalLink, Pencil, Trash2 } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { DefaultText } from "@/components/DefaultText";
import { Header } from "@/components/Navigation/Header";
import { SmallText } from "@/components/SmallText";
import { useRecipes } from "@/hooks/useRecipes";
import { useSync } from "@/hooks/useSync";

const formatTime = (minutes: number | undefined): string | null => {
  if (!minutes || minutes === 0) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useUnistyles();
  const { recipes, isLoading, deleteRecipe } = useRecipes();
  const { isSyncing, triggerSync } = useSync();

  const recipe = useMemo(() => recipes.find((r) => r.serverId === id) ?? null, [recipes, id]);

  const handleEdit = useCallback(() => {
    if (!recipe) return;
    router.push(`/recipe/create?id=${recipe.serverId}`);
  }, [recipe]);

  const handleDelete = useCallback(() => {
    if (!recipe) return;
    Alert.alert("Delete Recipe", `Delete "${recipe.title}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRecipe(recipe.serverId);
            router.back();
          } catch (error) {
            console.warn("[RecipeDetail] Delete error:", error);
            Alert.alert("Error", "Failed to delete recipe.");
          }
        },
      },
    ]);
  }, [recipe, deleteRecipe]);

  if (isLoading) {
    return (
      <View style={styles.outerContainer}>
        <Header title="Loading..." showBack backgroundColor="#b2ecca" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.outerContainer}>
        <Header title="Not Found" showBack backgroundColor="#b2ecca" />
        <View style={styles.centered}>
          <DefaultText text="Recipe not found" additionalStyles={{ color: theme.colors.grey }} />
        </View>
      </View>
    );
  }

  const prepTime = formatTime(recipe.prepTime);
  const cookTime = formatTime(recipe.cookTime);
  const totalTime = formatTime(recipe.totalTime);

  return (
    <View style={styles.outerContainer}>
      <Header
        title={recipe.title}
        showBack
        backgroundColor="#b2ecca"
        rightElement={
          <Pressable onPress={handleEdit} hitSlop={8}>
            <Pencil size={22} color={theme.colors.backgroundAccent} />
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
        {/* Image placeholder */}
        {recipe.image ? (
          <View style={styles.imagePlaceholder}>
            <CookingPot size={48} color={theme.colors.white} />
          </View>
        ) : null}

        {/* Metadata row */}
        {(prepTime || cookTime || totalTime || recipe.servings) && (
          <View style={styles.metaRow}>
            {prepTime && (
              <View style={styles.metaCard}>
                <Clock size={16} color={theme.colors.typography} />
                <SmallText text={`Prep: ${prepTime}`} />
              </View>
            )}
            {cookTime && (
              <View style={styles.metaCard}>
                <Clock size={16} color={theme.colors.typography} />
                <SmallText text={`Cook: ${cookTime}`} />
              </View>
            )}
            {totalTime && (
              <View style={styles.metaCard}>
                <Clock size={16} color={theme.colors.typography} />
                <SmallText text={`Total: ${totalTime}`} />
              </View>
            )}
            {recipe.servings ? (
              <View style={styles.metaCard}>
                <SmallText text={`Serves: ${recipe.servings}`} />
              </View>
            ) : null}
          </View>
        )}

        {/* Description */}
        {recipe.description ? (
          <DefaultText text={recipe.description} />
        ) : null}

        {/* Source URL */}
        {recipe.sourceUrl ? (
          <Pressable
            style={styles.linkRow}
            onPress={() => recipe.sourceUrl && Linking.openURL(recipe.sourceUrl)}
          >
            <ExternalLink size={14} color={theme.colors.info} />
            <SmallText
              text="View original recipe"
              additionalStyles={{ color: theme.colors.info }}
            />
          </Pressable>
        ) : null}

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {recipe.tags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <SmallText text={tag} />
              </View>
            ))}
          </View>
        )}

        {/* Ingredients */}
        {recipe.ingredients.length > 0 && (
          <View style={styles.section}>
            <DefaultText
              text="Ingredients"
              additionalStyles={{ fontWeight: "700", fontSize: theme.fontSizes.lg }}
            />
            <View style={styles.card}>
              {recipe.ingredients.map((ing, index) => {
                const showGroup =
                  ing.group &&
                  (index === 0 || recipe.ingredients[index - 1]?.group !== ing.group);
                return (
                  <View key={index}>
                    {showGroup && (
                      <DefaultText
                        text={ing.group!}
                        additionalStyles={{
                          fontWeight: "600",
                          marginTop: index > 0 ? 12 : 0,
                          marginBottom: 4,
                        }}
                      />
                    )}
                    <DefaultText text={`•  ${ing.text}`} />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Steps */}
        {recipe.steps.length > 0 && (
          <View style={styles.section}>
            <DefaultText
              text="Steps"
              additionalStyles={{ fontWeight: "700", fontSize: theme.fontSizes.lg }}
            />
            <View style={styles.card}>
              {recipe.steps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <DefaultText
                    text={`${index + 1}.`}
                    additionalStyles={{ fontWeight: "700", width: 28 }}
                  />
                  <DefaultText text={step.text} additionalStyles={{ flex: 1 }} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        {recipe.notes ? (
          <View style={styles.section}>
            <DefaultText
              text="Notes"
              additionalStyles={{ fontWeight: "700", fontSize: theme.fontSizes.lg }}
            />
            <View style={styles.card}>
              <DefaultText text={recipe.notes} />
            </View>
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={handleEdit}>
            <Pencil size={18} color={theme.colors.primary} />
            <DefaultText text="Edit Recipe" additionalStyles={{ color: theme.colors.primary }} />
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleDelete}>
            <Trash2 size={18} color={theme.colors.error} />
            <DefaultText text="Delete Recipe" additionalStyles={{ color: theme.colors.error }} />
          </Pressable>
        </View>
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
    gap: theme.spacing[4],
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#b2ecca",
    borderRadius: theme.borderRadiusSm,
    justifyContent: "center",
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  metaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadiusXs,
    borderWidth: 1,
    borderColor: theme.colors.greyLight,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  tagChip: {
    backgroundColor: "#b2ecca",
    paddingVertical: 4,
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadiusXs,
  },
  section: {
    gap: theme.spacing[2],
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[4],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    borderWidth: 2,
    borderColor: theme.colors.black,
    gap: theme.spacing[2],
  },
  stepRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
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
