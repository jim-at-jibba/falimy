import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "../../components/Button";
import { DefaultText } from "../../components/DefaultText";
import Title from "../../components/Title";

export default function AuthHome() {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Title text="Welcome to Falimy" />
        <DefaultText text="Your private family hub." />

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

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
}));
