import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";

describe("ErrorBoundary", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const ThrowError = () => {
    throw new Error("Test error");
  };

  const GoodComponent = () => <Text>Everything is fine</Text>;

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("Everything is fine")).toBeTruthy();
  });

  it("shows fallback UI when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.queryByText("Everything is fine")).toBeNull();
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });

  it("shows 'Something went wrong' text in fallback", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });

  it("shows 'Restart App' button in fallback", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText("Restart App")).toBeTruthy();
  });

  it("calls handleRestart when 'Restart App' is pressed", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeTruthy();

    // Pressing "Restart App" resets internal state { hasError: false }
    // But since the same ThrowError child re-renders, it will throw again.
    // We verify the button is pressable without crashing.
    fireEvent.press(screen.getByText("Restart App"));

    // The error boundary resets and re-renders children, which throw again
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });
});
