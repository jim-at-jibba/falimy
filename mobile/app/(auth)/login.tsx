import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button } from "../../src/components/Button";
import { getPocketBase } from "../../src/api/pocketbase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const pb = await getPocketBase();
      if (!pb) {
        router.replace("/(auth)/server-url");
        return;
      }

      await pb.collection("users").authWithPassword(email.trim(), password);
      router.replace("/(tabs)");
    } catch {
      setError("Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Log In</Text>
        <Text style={styles.subtitle}>Use your family account credentials.</Text>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label={loading ? "Signing In..." : "Sign In"} onPress={handleLogin} disabled={loading} />
        <Button
          label="Need to join a family?"
          onPress={() => router.push("/(auth)/join-family")}
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
    marginBottom: 12,
  },
  error: {
    color: "#b11d1d",
    marginBottom: 10,
  },
});
