import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#f6f8fb" },
        headerTintColor: "#0d3a5a",
      }}
    />
  );
}
