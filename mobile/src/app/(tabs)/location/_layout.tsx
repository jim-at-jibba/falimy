import { Stack } from "expo-router";

export default function LocationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="geofences" />
      <Stack.Screen name="create-geofence" />
      <Stack.Screen name="timeline" />
    </Stack>
  );
}
