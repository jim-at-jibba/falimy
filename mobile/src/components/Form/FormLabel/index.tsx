import { Text, TextStyle } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";

interface Props {
  label: string;
  additionalStyles?: TextStyle;
}

export const FormLabel = ({ label, additionalStyles = {} }: Props) => {
  const { styles } = useStyles(stylesheet);
  return <Text style={[styles.textInput, additionalStyles]}>{label}</Text>;
};

const stylesheet = createStyleSheet((theme, runtime) => ({
  textInput: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "700",
    color: theme.colors.greyDark,
    marginBottom: theme.spacing[3],
  },
}));
