import ButtonContainer from "./ButtonContainer";
import ButtonText from "./ButtonText";

type ButtonVariant = "primary" | "secondary" | "social";

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
};

export const Button = ({ label, onPress, disabled, variant = "primary" }: ButtonProps) => {
  return (
    <ButtonContainer handlePress={onPress} disabled={disabled} variant={variant}>
      <ButtonText label={label} variant={variant} />
    </ButtonContainer>
  );
};
