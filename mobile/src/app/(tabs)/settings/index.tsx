import { router } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "@/components/Button";
import { DefaultText } from "@/components/DefaultText";
import { Header } from "@/components/Navigation/Header";

export default function SettingsHome() {
  return (
    <View style={styles.container}>
      <Header title="Settings" backgroundColor="#fadeaf" />
      <View style={styles.content}>
        <DefaultText text="Manage your family and server connection." />

        <Button label="Family" onPress={() => router.push("/(tabs)/settings/family")} />
        <Button
          label="Change Server URL"
          onPress={() => router.push("/(auth)/server-url")}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing[5],
    gap: theme.spacing[3],
  },
}));
