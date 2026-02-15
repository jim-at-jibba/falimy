import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";
import { Toggle } from "@/components/Toggle/Toggle";

jest.mock("lucide-react-native", () => ({
  AlertTriangle: "AlertTriangle",
  ChevronLeft: "ChevronLeft",
  ChevronRight: "ChevronRight",
  Check: "Check",
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
}));

describe("Toggle", () => {
  const options = [
    { label: "Option 1", value: "opt1" },
    { label: "Option 2", value: "opt2" },
    { label: "Option 3", value: "opt3" },
  ];

  it("renders all option labels", () => {
    render(
      <Toggle 
        options={options} 
        value="opt1" 
        onChange={jest.fn()} 
      />
    );
    expect(screen.getByText("Option 1")).toBeTruthy();
    expect(screen.getByText("Option 2")).toBeTruthy();
    expect(screen.getByText("Option 3")).toBeTruthy();
  });

  it("calls onChange with correct value when option pressed", () => {
    const handleChange = jest.fn();
    render(
      <Toggle 
        options={options} 
        value="opt1" 
        onChange={handleChange} 
      />
    );
    
    fireEvent.press(screen.getByText("Option 2"));
    expect(handleChange).toHaveBeenCalledWith("opt2");
    
    fireEvent.press(screen.getByText("Option 3"));
    expect(handleChange).toHaveBeenCalledWith("opt3");
  });

  it("disables all options when disabled is true", () => {
    const handleChange = jest.fn();
    render(
      <Toggle 
        options={options} 
        value="opt1" 
        onChange={handleChange} 
        disabled={true}
      />
    );
    
    const option1 = screen.getByText("Option 1");
    fireEvent.press(option1);
    expect(handleChange).not.toHaveBeenCalled();
    
    const option2 = screen.getByText("Option 2");
    fireEvent.press(option2);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
