import { StyleSheet } from "react-native-unistyles";
import { DefaultText } from "@/components/DefaultText";

interface ButtonTextProps {
  label: string;
  variant?: "primary" | "secondary" | "social";
}

export default function ButtonText({ label, variant = "primary" }: ButtonTextProps) {
  return <DefaultText additionalStyles={styles[variant]} text={label} />;
}

const styles = StyleSheet.create((theme) => ({
  primary: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: 24,
  },
  secondary: {
    color: theme.colors.typography,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: 24,
  },
  social: {
    color: theme.colors.typography,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: 24,
  },
}));
