import { router, useLocalSearchParams } from "expo-router";
import { Link2, Plus, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { DefaultText } from "@/components/DefaultText";
import { Header } from "@/components/Navigation/Header";
import { SmallText } from "@/components/SmallText";
import { useRecipes } from "@/hooks/useRecipes";

export default function CreateRecipeScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;
  const { theme } = useUnistyles();
  const { recipes, createRecipe, updateRecipe, extractRecipeFromUrl } = useRecipes();

  const existingRecipe = useMemo(
    () => (isEditing ? recipes.find((r) => r.serverId === id) ?? null : null),
    [recipes, id, isEditing],
  );

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<{ quantity?: string; name?: string; group?: string }[]>([
    { quantity: "", name: "" },
  ]);
  const [steps, setSteps] = useState<{ text: string; position: number }[]>([
    { text: "", position: 1 },
  ]);
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [servings, setServings] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (existingRecipe) {
      setTitle(existingRecipe.title);
      setDescription(existingRecipe.description ?? "");
      setIngredients(
        existingRecipe.ingredients.length > 0 ? existingRecipe.ingredients : [{ quantity: "", name: "" }],
      );
      setSteps(
        existingRecipe.steps.length > 0
          ? existingRecipe.steps
          : [{ text: "", position: 1 }],
      );
      setPrepTime(existingRecipe.prepTime ? String(existingRecipe.prepTime) : "");
      setCookTime(existingRecipe.cookTime ? String(existingRecipe.cookTime) : "");
      setTotalTime(existingRecipe.totalTime ? String(existingRecipe.totalTime) : "");
      setServings(existingRecipe.servings ?? "");
      setNotes(existingRecipe.notes ?? "");
      setTags(existingRecipe.tags);
      if (existingRecipe.sourceUrl) setImportUrl(existingRecipe.sourceUrl);
    }
  }, [existingRecipe]);

  const handleExtract = async () => {
    if (!importUrl.trim()) return;
    setIsExtracting(true);
    try {
      const data = await extractRecipeFromUrl(importUrl.trim());
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.ingredients.length > 0) {
        // Parse extracted ingredients (which come as "text" field) into quantity + name
        const parsed = data.ingredients.map((ing) => {
          // Try to split "2 cups flour" into quantity="2 cups" name="flour"
          const match = ing.text.match(/^([\d\s\/\-.,]+(?:\s+(?:cup|cups|tsp|tbsp|teaspoon|tablespoon|oz|lb|g|kg|ml|l|piece|pieces|clove|cloves))?)\s+(.+)$/i);
          if (match) {
            return { quantity: match[1].trim(), name: match[2].trim(), group: ing.group };
          }
          // If no quantity found, just use the whole text as name
          return { quantity: "", name: ing.text, group: ing.group };
        });
        setIngredients(parsed);
      }
      if (data.steps.length > 0) setSteps(data.steps);
      if (data.prep_time) setPrepTime(String(data.prep_time));
      if (data.cook_time) setCookTime(String(data.cook_time));
      if (data.total_time) setTotalTime(String(data.total_time));
      if (data.servings) setServings(data.servings);
    } catch (error) {
      Alert.alert(
        "Extraction Failed",
        error instanceof Error ? error.message : "Could not extract recipe from URL.",
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a recipe title.");
      return;
    }
    // Combine quantity and name into text field, filter out empty ones
    const validIngredients = ingredients
      .filter((i) => i.name && i.name.trim())
      .map((i) => ({
        text: i.quantity ? `${i.quantity.trim()} ${i.name!.trim()}` : i.name!.trim(),
        group: i.group,
      }));
    const validSteps = steps
      .filter((s) => s.text.trim())
      .map((s, i) => ({ ...s, position: i + 1 }));

    if (validIngredients.length === 0) {
      Alert.alert("Required", "Please add at least one ingredient.");
      return;
    }
    if (validSteps.length === 0) {
      Alert.alert("Required", "Please add at least one step.");
      return;
    }

    setIsSaving(true);
    try {
      const recipeData = {
        title: title.trim(),
        description: description.trim() || undefined,
        ingredients: validIngredients,
        steps: validSteps,
        prep_time: prepTime ? parseInt(prepTime, 10) : undefined,
        cook_time: cookTime ? parseInt(cookTime, 10) : undefined,
        total_time: totalTime ? parseInt(totalTime, 10) : undefined,
        servings: servings.trim() || undefined,
        source_url: importUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      if (isEditing && id) {
        await updateRecipe(id, recipeData);
        router.back();
      } else {
        const newId = await createRecipe(recipeData);
        router.replace({
          pathname: "/recipe/[id]",
          params: { id: newId },
        });
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save recipe.");
    } finally {
      setIsSaving(false);
    }
  };

  // Dynamic list helpers
  const addIngredient = () => setIngredients([...ingredients, { quantity: "", name: "" }]);
  const updateIngredientField = (index: number, field: "quantity" | "name", value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    } else {
      setIngredients([{ quantity: "", name: "" }]);
    }
  };

  const addStep = () =>
    setSteps([...steps, { text: "", position: steps.length + 1 }]);
  const updateStep = (text: string, index: number) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], text };
    setSteps(updated);
  };
  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(
        steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, position: i + 1 })),
      );
    } else {
      updateStep("", 0);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  return (
    <View style={styles.outerContainer}>
      <Header
        title={isEditing ? "Edit Recipe" : "New Recipe"}
        showBack
        backgroundColor="#b2ecca"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* URL Import - Temporarily disabled while debugging server extraction endpoint */}
          {false && !isEditing && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Link2 size={18} color={theme.colors.typography} />
                <DefaultText
                  text="Import from URL"
                  additionalStyles={{ fontWeight: "600" }}
                />
              </View>
              <View style={styles.importRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Paste recipe URL..."
                  placeholderTextColor={theme.colors.grey}
                  value={importUrl}
                  onChangeText={setImportUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <Pressable
                  style={[
                    styles.extractButton,
                    (!importUrl.trim() || isExtracting) && { opacity: 0.5 },
                  ]}
                  onPress={handleExtract}
                  disabled={isExtracting || !importUrl.trim()}
                >
                  {isExtracting ? (
                    <ActivityIndicator size="small" color={theme.colors.typography} />
                  ) : (
                    <DefaultText text="Extract" additionalStyles={{ fontWeight: "600" }} />
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {/* Title */}
          <View style={styles.section}>
            <DefaultText
              text="Title"
              additionalStyles={{ fontWeight: "700", fontSize: theme.fontSizes.lg }}
            />
            <TextInput
              style={styles.input}
              placeholder="Recipe title"
              placeholderTextColor={theme.colors.grey}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <DefaultText
              text="Description"
              additionalStyles={{ fontWeight: "700", fontSize: theme.fontSizes.lg }}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Short description..."
              placeholderTextColor={theme.colors.grey}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <DefaultText
              text="Ingredients"
              additionalStyles={{ fontWeight: "700", fontSize: theme.fontSizes.lg }}
            />
            {ingredients.map((ing, index) => (
              <View key={index} style={styles.ingredientRow}>
                <TextInput
                  style={[styles.input, styles.quantityInput]}
                  placeholder="Qty"
                  placeholderTextColor={theme.colors.grey}
                  value={ing.quantity || ""}
                  onChangeText={(quantity) => updateIngredientField(index, "quantity", quantity)}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Ingredient name"
                  placeholderTextColor={theme.colors.grey}
                  value={ing.name || ""}
                  onChangeText={(name) => updateIngredientField(index, "name", name)}
                />
                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeIngredient(index)}
                >
                  <X size={18} color={theme.colors.grey} />
                </Pressable>
              </View>
            ))}
            <Pressable style={styles.addRowButton} onPress={addIngredient}>
              <Plus size={16} color={theme.colors.typography} />
              <SmallText text="Add ingredient" />
            </Pressable>
          </View>

          {/* Steps */}
          <View style={styles.section}>
            <DefaultText
              text="Steps"
              additionalStyles={{ fontWeight: "700", fontSize: theme.fontSizes.lg }}
            />
            {steps.map((step, index) => (
              <View key={index} style={styles.dynamicRow}>
                <View style={styles.stepNumber}>
                  <SmallText text={`${index + 1}`} />
                </View>
                <TextInput
                  style={[styles.input, styles.textArea, { flex: 1, minHeight: 80 }]}
                  placeholder={`Step ${index + 1}`}
                  placeholderTextColor={theme.colors.grey}
                  value={step.text}
                  onChangeText={(text) => updateStep(text, index)}
                  multiline
                  textAlignVertical="top"
                />
                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeStep(index)}
                >
                  <X size={18} color={theme.colors.grey} />
                </Pressable>
              </View>
            ))}
            <Pressable style={styles.addRowButton} onPress={addStep}>
              <Plus size={16} color={theme.colors.typography} />
              <SmallText text="Add step" />
            </Pressable>
          </View>

          {/* Times & Servings */}
          <View style={styles.section}>
            <DefaultText
              text="Timing"
              additionalStyles={{ fontWeight: "700", fontSize: theme.fontSizes.lg }}
            />
            <View style={styles.timesRow}>
              <View style={{ flex: 1 }}>
                <SmallText text="Prep (min)" />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={theme.colors.grey}
                  value={prepTime}
                  onChangeText={setPrepTime}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <SmallText text="Cook (min)" />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={theme.colors.grey}
                  value={cookTime}
                  onChangeText={setCookTime}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <SmallText text="Total (min)" />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={theme.colors.grey}
                  value={totalTime}
                  onChangeText={setTotalTime}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={{ marginTop: theme.spacing[3] }}>
              <SmallText text="Servings" />
              <TextInput
                style={styles.input}
                placeholder="e.g. 4 servings"
                placeholderTextColor={theme.colors.grey}
                value={servings}
                onChangeText={setServings}
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <DefaultText
              text="Notes"
              additionalStyles={{ fontWeight: "700", fontSize: theme.fontSizes.lg }}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional notes..."
              placeholderTextColor={theme.colors.grey}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <DefaultText
              text="Tags"
              additionalStyles={{ fontWeight: "700", fontSize: theme.fontSizes.lg }}
            />
            <View style={styles.dynamicRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Add a tag..."
                placeholderTextColor={theme.colors.grey}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                returnKeyType="done"
              />
              <Pressable style={styles.extractButton} onPress={addTag}>
                <Plus size={18} color={theme.colors.typography} />
              </Pressable>
            </View>
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <SmallText text={tag} />
                    <Pressable onPress={() => setTags(tags.filter((t) => t !== tag))}>
                      <X size={14} color={theme.colors.typography} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Spacer for save button */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save button */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={theme.colors.typography} />
          ) : (
            <DefaultText
              text={isEditing ? "Update Recipe" : "Save Recipe"}
              additionalStyles={{ fontWeight: "700", fontSize: theme.fontSizes.md }}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing[5],
    gap: theme.spacing[5],
  },
  section: {
    gap: theme.spacing[3],
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  importRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
    alignItems: "center",
  },
  extractButton: {
    backgroundColor: theme.colors.greyBackground,
    paddingHorizontal: theme.spacing[4],
    height: theme.inputHeight,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.borderRadiusXs,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  input: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography,
    backgroundColor: theme.colors.greyBackground,
    borderRadius: theme.borderRadiusXs,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    height: theme.inputHeight,
  },
  textArea: {
    height: 100,
    paddingTop: theme.spacing[3],
  },
  dynamicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  quantityInput: {
    width: 80,
    flex: 0,
  },
  removeButton: {
    padding: theme.spacing[2],
  },
  addRowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.greySoft,
    borderStyle: "dashed",
    borderRadius: theme.borderRadiusXs,
  },
  stepNumber: {
    width: 24,
    alignItems: "center",
  },
  timesRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    backgroundColor: "#b2ecca",
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadiusXs,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing[5],
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.greyLight,
  },
  saveButton: {
    backgroundColor: "#b2ecca",
    height: theme.buttonHeight,
    borderRadius: theme.borderRadiusXs,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
}));
