import { ChevronRight } from "lucide-react-native";
import { Pressable, type TextStyle, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { DefaultText } from "@/components/DefaultText";

interface SettingsItemProps {
  icon?: React.ReactNode;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  additionalLabelStyle?: TextStyle;
}

export function SettingsItem({
  icon,
  label,
  onPress,
  rightElement,
  additionalLabelStyle,
}: SettingsItemProps) {
  const { theme } = useUnistyles();

  const labelStyles: TextStyle[] = [styles.settingsItemLabel];
  if (additionalLabelStyle) {
    labelStyles.push(additionalLabelStyle);
  }

  return (
    <Pressable style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        {icon}
        <DefaultText text={label} additionalStyles={labelStyles} />
      </View>
      {rightElement ?? <ChevronRight size={20} color={theme.colors.typography} />}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing[4],
    backgroundColor: theme.colors.background,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  settingsItemLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.typography,
  },
}));
