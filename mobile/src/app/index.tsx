import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "../contexts/AuthContext";
import { getServerUrl } from "../utils/config";

/**
 * Root index screen — acts as a splash/routing gate.
 *
 * Waits for AuthContext to finish loading (which awaits AsyncAuthStore
 * hydration via getPocketBase), then routes to the appropriate screen.
 * All auth state flows through AuthContext — no direct PocketBase checks.
 */
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const route = async () => {
      const serverUrl = await getServerUrl();
      if (!serverUrl) {
        router.replace("/(auth)/server-url");
        return;
      }

      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)");
      }
    };

    route();
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0c8ce9" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f6f8fb",
  },
});
