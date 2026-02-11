import { Text, type TextStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface TitleProps {
  text: string;
  additionalStyles?: TextStyle | TextStyle[];
}
const Title = ({ text, additionalStyles }: TitleProps) => {
  return <Text style={[styles.text, additionalStyles]}>{text}</Text>;
};

const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.typography,
    fontSize: theme.fontSizes.lg,
    lineHeight: 38,
    fontWeight: 700,
    fontFamily: theme.fontFamily.bold,
  },
}));

export default Title;
