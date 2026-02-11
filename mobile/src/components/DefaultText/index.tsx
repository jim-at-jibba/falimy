import { Text, TextStyle } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";

interface DefaultTextProps {
  text: string;
  additionalStyles?: TextStyle;
  numberOfLines?: number;
}
export const DefaultText = ({ text, additionalStyles, numberOfLines }: DefaultTextProps) => {
  const { styles } = useStyles(stylesheet);
  return (
    <Text style={[styles.text, additionalStyles]} numberOfLines={numberOfLines}>
      {text}
    </Text>
  );
};

const stylesheet = createStyleSheet((theme, runtime) => ({
  text: {
    color: theme.colors.typography,
    fontSize: theme.fontSizes.sm,
    lineHeight: 22,
    fontWeight: 400,
    fontFamily: theme.fontFamily.body,
  },
}));
