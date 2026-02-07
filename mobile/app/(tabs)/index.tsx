import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button } from "../../src/components/Button";
import { getPocketBase } from "../../src/api/pocketbase";

export default function Home() {
  const handleLogout = async () => {
    const pb = await getPocketBase();
    pb?.authStore.clear();
    router.replace("/(auth)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Falimy</Text>
        <Text style={styles.subtitle}>Phase 1 setup complete. Next up: lists and location.</Text>
        <Button label="Log Out" onPress={handleLogout} variant="secondary" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fb",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#0d3a5a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0d3a5a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#3f566b",
    marginBottom: 16,
  },
});
