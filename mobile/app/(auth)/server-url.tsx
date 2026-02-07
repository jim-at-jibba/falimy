import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button } from "../../src/components/Button";
import { resetPocketBase, validateServerUrl } from "../../src/api/pocketbase";
import { setServerUrl } from "../../src/utils/config";

export default function ServerUrl() {
  const [serverUrl, setServerUrlState] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!serverUrl.trim()) {
      setError("Enter your PocketBase server URL.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const normalized = await validateServerUrl(serverUrl);
      await setServerUrl(normalized);
      resetPocketBase();
      router.replace("/(auth)");
    } catch {
      setError("Could not reach that server. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Connect to PocketBase</Text>
        <Text style={styles.subtitle}>
          Enter the URL where your family hosts PocketBase.
        </Text>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="https://family.example.com"
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrlState}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Save and Continue" onPress={handleSave} disabled={loading} />

        {loading ? <ActivityIndicator style={styles.loading} /> : null}
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
    fontSize: 22,
    fontWeight: "700",
    color: "#0d3a5a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#3f566b",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d7e1ea",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    color: "#b11d1d",
    marginBottom: 10,
  },
  loading: {
    marginTop: 8,
  },
});
