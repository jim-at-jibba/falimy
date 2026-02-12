import { Stack } from "expo-router";

export default function ListsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#f6f8fb" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Lists" }} />
      <Stack.Screen name="[listId]" options={{ title: "List" }} />
    </Stack>
  );
}
