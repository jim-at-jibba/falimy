import { Stack } from "expo-router";

export default function ShoppingLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#f6f8fb" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Shopping Lists" }} />
      <Stack.Screen name="[listId]" options={{ title: "List" }} />
    </Stack>
  );
}
