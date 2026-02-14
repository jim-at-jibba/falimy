import ButtonContainer from "./ButtonContainer";
import ButtonText from "./ButtonText";

type ButtonVariant = "primary" | "secondary" | "social";

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export const Button = ({ label, onPress, disabled, variant = "primary", accessibilityLabel, accessibilityHint }: ButtonProps) => {
  return (
    <ButtonContainer 
      handlePress={onPress} 
      disabled={disabled} 
      variant={variant}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
    >
      <ButtonText label={label} variant={variant} />
    </ButtonContainer>
  );
};
