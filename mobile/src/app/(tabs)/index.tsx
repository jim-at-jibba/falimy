import { Q } from "@nozbe/watermelondb";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Button } from "@/components/Button";
import { DefaultText } from "@/components/DefaultText";
import { Header } from "@/components/Navigation/Header";
import { SmallText } from "@/components/SmallText";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useFamilyLocations } from "@/hooks/useFamilyLocations";
import { useGeofences } from "@/hooks/useGeofences";
import { useLists } from "@/hooks/useLists";
import { useRecipes } from "@/hooks/useRecipes";

export default function Home() {
  const { theme } = useUnistyles();
  const database = useDatabase();
  const { user } = useAuth();
  const { lists, isLoading: listsLoading } = useLists();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { geofences, isLoading: geofencesLoading } = useGeofences();
  const { members, isLoading: membersLoading } = useFamilyLocations();
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [tasksCountLoading, setTasksCountLoading] = useState(true);

  const activeGeofenceCount = geofences.filter((geofence) => geofence.isEnabled).length;

  useEffect(() => {
    if (listsLoading) return;

    const listServerIds = lists.map((list) => list.serverId).filter(Boolean);
    if (listServerIds.length === 0) {
      setCompletedTasksCount(0);
      setTasksCountLoading(false);
      return;
    }

    const subscription = database
      .get("list_items")
      .query(Q.where("list_id", Q.oneOf(listServerIds)), Q.where("is_checked", true))
      .observeCount()
      .subscribe({
        next: (count) => {
          setCompletedTasksCount(count);
          setTasksCountLoading(false);
        },
        error: (error) => {
          console.warn("[Home] Completed tasks count error:", error);
          setTasksCountLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [database, lists, listsLoading]);

  const isLoading =
    listsLoading || recipesLoading || geofencesLoading || membersLoading || tasksCountLoading;

  return (
    <View style={styles.container}>
      <Header title="Falimy" backgroundColor="#b4dbfa" />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <DefaultText
          text={`Welcome${user?.name ? `, ${user.name}` : ""}. Your private family hub.`}
        />
        <SmallText text="Here is your family snapshot today." />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <Pressable
              style={[styles.statCard, styles.statCardLists]}
              onPress={() => router.push("/(tabs)/lists")}
            >
              <DefaultText text={String(lists.length)} additionalStyles={styles.statValue} />
              <SmallText text={`Completed tasks: ${completedTasksCount}`} />
            </Pressable>
            <Pressable
              style={[styles.statCard, styles.statCardRecipes]}
              onPress={() => router.push("/(tabs)/recipes")}
            >
              <DefaultText text={String(recipes.length)} additionalStyles={styles.statValue} />
              <SmallText text="Recipes saved" />
            </Pressable>
            <Pressable
              style={[styles.statCard, styles.statCardMembers]}
              onPress={() => router.push("/(tabs)/location")}
            >
              <DefaultText text={String(members.length)} additionalStyles={styles.statValue} />
              <SmallText text="Family members sharing" />
            </Pressable>
            <Pressable
              style={[styles.statCard, styles.statCardGeofences]}
              onPress={() => router.push("/(tabs)/location/geofences")}
            >
              <DefaultText text={String(activeGeofenceCount)} additionalStyles={styles.statValue} />
              <SmallText text="Active geofences" />
            </Pressable>
          </View>
        )}

        <View style={styles.quickActions}>
          <Button label="Open Lists" onPress={() => router.push("/(tabs)/lists")} />
          <Button
            label="Open Recipes"
            onPress={() => router.push("/(tabs)/recipes")}
            variant="secondary"
          />
          <Button
            label="Open Map"
            onPress={() => router.push("/(tabs)/location")}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing[5],
    gap: theme.spacing[3],
    paddingBottom: theme.spacing[8],
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[3],
  },
  statCard: {
    width: "47%",
    minHeight: 96,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[3],
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    borderWidth: Platform.select({ android: 3, default: 2 }),
    borderColor: theme.colors.black,
  },
  statCardLists: {
    backgroundColor: theme.colors.blue,
  },
  statCardRecipes: {
    backgroundColor: theme.colors.green,
  },
  statCardMembers: {
    backgroundColor: theme.colors.purple,
  },
  statCardGeofences: {
    backgroundColor: theme.colors.orange,
  },
  statValue: {
    fontSize: theme.fontSizes.xl,
    lineHeight: 30,
    fontFamily: theme.fontFamily.bold,
  },
  quickActions: {
    gap: theme.spacing[3],
    marginTop: theme.spacing[2],
  },
}));
