import { Tabs } from "expo-router";
import { House, List, Settings } from "lucide-react-native";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtime } from "@/hooks/useRealtime";
import { useSync } from "@/hooks/useSync";

export default function TabsLayout() {
  const { refresh, user } = useAuth();

  // Ensure auth context is up to date when we reach the tabs.
  // The login/signup screens authenticate via the PocketBase singleton
  // but may not have triggered a context refresh.
  useEffect(() => {
    if (!user) {
      refresh();
    }
  }, [user, refresh]);

  // Auto-sync (pull) on mount, foreground, and 5-min interval
  useSync();

  // Subscribe to PocketBase SSE — directly upserts records into WMDB
  useRealtime();

  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#f6f8fb" },
        tabBarStyle: { backgroundColor: "#ffffff" },
        tabBarActiveTintColor: "#0c8ce9",
        tabBarInactiveTintColor: "#6b7d8d",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: "Lists",
          tabBarLabel: "Lists",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
