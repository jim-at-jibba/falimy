import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../styles";
import { Toaster } from "sonner-native";
import { AuthProvider } from "../contexts/AuthContext";
import { DatabaseProvider } from "../contexts/DatabaseContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
    <DatabaseProvider>
      <AuthProvider>
        <ErrorBoundary>
          <StatusBar style="dark" />
          <InitialLayout />
          <Toaster />
        </ErrorBoundary>
      </AuthProvider>
    </DatabaseProvider>
  );
}
