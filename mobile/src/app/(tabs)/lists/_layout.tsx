import { Stack } from "expo-router";

export default function ListsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[listId]" />
    </Stack>
  );
}
