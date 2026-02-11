import * as Application from "expo-application";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface VersionDisplayProps {
  containerStyle?: object;
}

export function VersionDisplay({ containerStyle }: VersionDisplayProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.text}>
        Version {Application.nativeApplicationVersion} ({Application.nativeBuildVersion})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
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
