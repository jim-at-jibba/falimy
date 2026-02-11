import { View, Text } from "react-native";
import * as Application from "expo-application";
import { createStyleSheet, useStyles } from "react-native-unistyles";

interface VersionDisplayProps {
  containerStyle?: object;
}

export function VersionDisplay({ containerStyle }: VersionDisplayProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.text}>
        Version {Application.nativeApplicationVersion} ({Application.nativeBuildVersion})
      </Text>
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    width: "100%",
    alignItems: "center",
  },
  text: {
    fontSize: theme.fontSizes.xxs || 10,
    color: theme.colors.grey,
    opacity: 0.7,
  },
}));
