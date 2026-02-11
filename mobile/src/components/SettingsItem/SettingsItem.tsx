import { View, Pressable, TextStyle } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import { ChevronRight } from "lucide-react-native";
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
  const { styles, theme } = useStyles(stylesheet);

  // Combine base style with conditional style into a single object
  const labelStyle: TextStyle = {
    ...styles.settingsItemLabel,
    ...(additionalLabelStyle && additionalLabelStyle),
    // Add any conditional styles here if needed, e.g.:
    // ...(!icon && { marginLeft: 0 })
    // Relying on the 'gap' in parent View for now
  };

  return (
    <Pressable style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        {icon}
        {/* Pass the single, potentially merged, style object */}
        <DefaultText text={label} additionalStyles={labelStyle} />
      </View>
      {rightElement ?? <ChevronRight size={20} color={theme.colors.typography} />}
    </Pressable>
  );
}

const stylesheet = createStyleSheet(theme => ({
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing[4],
    backgroundColor: theme.colors.background,
    // Optionally add borderBottom for list usage:
    // borderBottomWidth: 1,
    // borderBottomColor: theme.colors.greyLight,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3], // This gap should handle spacing between icon and text
  },
  settingsItemLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.typography,
  },
}));
