import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";
import { Button } from "@/components/Button/index";

describe("Button", () => {
  it("renders button with label text", () => {
    const onPress = jest.fn();
    render(<Button label="Click me" onPress={onPress} />);
    expect(screen.getByText("Click me")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<Button label="Click me" onPress={onPress} />);
    fireEvent.press(screen.getByText("Click me"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    const onPress = jest.fn();
    render(<Button label="Click me" onPress={onPress} disabled={true} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    fireEvent.press(screen.getByText("Click me"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("has correct accessibility properties", () => {
    const onPress = jest.fn();
    render(
      <Button 
        label="Click me" 
        onPress={onPress} 
        accessibilityLabel="Action button"
        accessibilityHint="Double tap to perform action"
      />
    );
    const button = screen.getByRole("button");
    expect(button).toHaveProp("accessibilityLabel", "Action button");
    expect(button).toHaveProp("accessibilityHint", "Double tap to perform action");
  });

  it("uses label as accessibilityLabel when not provided", () => {
    const onPress = jest.fn();
    render(<Button label="Click me" onPress={onPress} />);
    const button = screen.getByRole("button");
    expect(button).toHaveProp("accessibilityLabel", "Click me");
  });
});
