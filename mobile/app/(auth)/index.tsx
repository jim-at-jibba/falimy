import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button } from "../../src/components/Button";

export default function AuthHome() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to Falimy</Text>
        <Text style={styles.subtitle}>Your private family hub.</Text>

        <Button label="Create Family" onPress={() => router.push("/(auth)/create-family")} />
        <Button label="Join Family" onPress={() => router.push("/(auth)/join-family")} />
        <Button label="Log In" onPress={() => router.push("/(auth)/login")} variant="secondary" />
        <Button
          label="Set Server URL"
          onPress={() => router.push("/(auth)/server-url")}
          variant="secondary"
        />
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
    fontSize: 26,
    fontWeight: "700",
    color: "#0d3a5a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#3f566b",
    marginBottom: 20,
  },
});
