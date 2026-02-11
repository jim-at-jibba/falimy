import { AlertCircle } from "lucide-react-native";
import type { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { SmallText } from "@/components/SmallText";

interface Props {
  message?: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
}

export const FormError = ({ message }: Props) => {
  const { theme } = useUnistyles();

  if (!message) return null;

  const messageText =
    typeof message === "string"
      ? message
      : typeof message.message === "string"
        ? message.message
        : "An error occurred";

  return (
    <>
      {messageText ? (
        <View style={styles.container}>
          <AlertCircle size={20} color={theme.colors.error} />
          <SmallText text={messageText} additionalStyles={styles.text} />
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: `${theme.colors.error}50`,
  },
  text: {
    marginLeft: theme.spacing[2],
    color: theme.colors.error,
    fontWeight: "600",
  },
}));
