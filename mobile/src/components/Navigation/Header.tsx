import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { BackButton } from "./BackButton";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
}

export function Header({ title, showBack = true, onBackPress, rightElement }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {showBack && <BackButton onPress={onBackPress} />}
        {title && (
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        )}
      </View>
      {rightElement && <View style={styles.headerRight}>{rightElement}</View>}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    height: 66,
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
    fontWeight: "bold",
    color: theme.colors.typography,
    flex: 1,
  },
}));
