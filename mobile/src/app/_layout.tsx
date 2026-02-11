import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import "../styles";
import { Toaster } from "sonner-native";

void SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <InitialLayout />
      <Toaster />
    </>
  );
}
