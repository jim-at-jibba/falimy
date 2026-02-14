import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { BackButton } from "./BackButton";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  backgroundColor?: string;
}

export function Header({
  title,
  showBack = false,
  onBackPress,
  rightElement,
  backgroundColor,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        { paddingTop: insets.top, backgroundColor: backgroundColor ?? "transparent" },
      ]}
      accessibilityRole="header"
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {showBack && <BackButton onPress={onBackPress} />}
          {title && (
            <Text 
              style={styles.title} 
              numberOfLines={1} 
              ellipsizeMode="tail"
              accessibilityRole="text"
              accessibilityLabel={`${title} screen`}
            >
              {title}
            </Text>
          )}
        </View>
        {rightElement && <View style={styles.headerRight}>{rightElement}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    borderBottomLeftRadius: theme.borderRadiusSm,
    borderBottomRightRadius: theme.borderRadiusSm,
    overflow: "hidden",
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[4],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    flex: 1,
    marginRight: theme.spacing[2],
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    flexShrink: 0,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.bold,
    fontWeight: "800",
    color: theme.colors.typography,
    flex: 1,
  },
}));
