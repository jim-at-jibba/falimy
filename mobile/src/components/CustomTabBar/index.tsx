import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { SmallText } from "@/components/SmallText";

const TAB_BAR_BG = "#3D3D3D";
const TAB_ACTIVE_BG = "#FFFFFF";
const TAB_INACTIVE_COLOR = "#B0B0B0";
const TAB_ACTIVE_ICON = "#3D3D3D";
const TAB_ACTIVE_LABEL = "#FFFFFF";

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : typeof options.title === "string"
                ? options.title
                : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          const iconColor = isFocused ? TAB_ACTIVE_ICON : TAB_INACTIVE_COLOR;
          const iconSize = 22;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              <View style={isFocused ? styles.activeIconWrapper : styles.iconContainer}>
                {isFocused && <View style={styles.activeBg} />}
                {options.tabBarIcon?.({
                  focused: isFocused,
                  color: iconColor,
                  size: iconSize,
                })}
              </View>

              <SmallText
                text={label}
                additionalStyles={{
                  color: isFocused ? TAB_ACTIVE_LABEL : TAB_INACTIVE_COLOR,
                  fontSize: theme.fontSizes.xxs,
                  fontFamily: isFocused ? theme.fontFamily.semiBold : theme.fontFamily.regular,
                  marginTop: 2,
                }}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    backgroundColor: TAB_BAR_BG,
  },
  bar: {
    flexDirection: "row",
    backgroundColor: TAB_BAR_BG,
    paddingVertical: 8,
    paddingHorizontal: 6,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 4,
    position: "relative",
  },
  activeBg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 14,
    backgroundColor: TAB_ACTIVE_BG,
    borderWidth: 4,
    borderColor: TAB_BAR_BG,
  },
  activeIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginTop: -22,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  iconContainer: {
    zIndex: 1,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
}));
