import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#f6f8fb" },
        headerTintColor: "#0d3a5a",
      }}
    />
  );
}
