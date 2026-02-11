import { router } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPocketBase } from "../../api/pocketbase";
import { Button } from "../../components/Button";
import { DefaultText } from "../../components/DefaultText";
import Title from "../../components/Title";

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
    <SafeAreaView>
      <View>
        <Title text="Log In" />
        <DefaultText text="Use your family account credentials." />

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Email"
          style={{
            borderWidth: 1,
            borderColor: "#d7e1ea",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            marginBottom: 12,
          }}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={{
            borderWidth: 1,
            borderColor: "#d7e1ea",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            marginBottom: 12,
          }}
          value={password}
          onChangeText={setPassword}
        />

        {error ? <DefaultText text={error} /> : null}

        <Button
          label={loading ? "Signing In..." : "Sign In"}
          onPress={handleLogin}
          disabled={loading}
        />
        <Button
          label="Need to join a family?"
          onPress={() => router.push("/(auth)/join-family")}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}
