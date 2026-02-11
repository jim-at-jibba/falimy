import { View } from "react-native";

interface Props {
  children: React.ReactNode;
}

export const FormInputContainer = ({ children }: Props) => {
  return <View>{children}</View>;
};
