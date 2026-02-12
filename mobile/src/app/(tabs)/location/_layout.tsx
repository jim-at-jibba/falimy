import { Stack } from "expo-router";

export default function LocationLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#f6f8fb" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Map" }} />
      <Stack.Screen name="settings" options={{ title: "Location Settings" }} />
      <Stack.Screen name="geofences" options={{ title: "Geofences" }} />
      <Stack.Screen name="create-geofence" options={{ title: "New Geofence" }} />
    </Stack>
  );
}
