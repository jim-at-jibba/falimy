import React, { Component, ErrorInfo, ReactNode, PureComponent } from "react";
import { View, Text } from "react-native";
import { Button } from "@/components/Button";
import { DefaultText } from "@/components/DefaultText";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export class ErrorBoundary extends PureComponent<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              alignItems: "center",
              gap: 12,
            }}
          >
            <DefaultText
              text="Something went wrong"
              additionalStyles={{
                fontSize: 20,
                fontWeight: "bold",
              }}
            />
            <DefaultText
              text="The app encountered an unexpected error."
              additionalStyles={{
                fontSize: 16,
                textAlign: "center",
              }}
            />

            {this.state.error && process.env.NODE_ENV === "development" && (
              <Text
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  textAlign: "center",
                  marginTop: 16,
                  fontFamily: "monospace",
                }}
              >
                {this.state.error.toString()}
              </Text>
            )}

            <Button label="Restart App" onPress={this.handleRestart} />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
