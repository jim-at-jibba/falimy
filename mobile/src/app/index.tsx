import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { getPocketBase } from "../api/pocketbase";
import { getServerUrl } from "../utils/config";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const serverUrl = await getServerUrl();
      if (!serverUrl) {
        router.replace("/(auth)/server-url");
        return;
      }

      const pb = await getPocketBase();
      if (pb?.authStore.isValid) {
        router.replace("/(tabs)");
        return;
      }

      router.replace("/(auth)");
    };

    init().finally(() => setLoading(false));
  }, []);

  if (!loading) {
    return null;
  }

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
