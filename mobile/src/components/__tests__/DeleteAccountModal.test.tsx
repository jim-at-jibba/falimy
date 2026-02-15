import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";
import { DeleteAccountModal } from "@/components/DeleteAccountModal";

describe("DeleteAccountModal", () => {
  const onClose = jest.fn();
  const onConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render modal content when visible=false", () => {
    render(
      <DeleteAccountModal 
        visible={false} 
        onClose={onClose} 
        onConfirm={onConfirm} 
      />
    );
    expect(screen.queryByText("Confirm Deletion")).toBeNull();
    expect(screen.queryByText("Cancel")).toBeNull();
  });

  it("renders warning text when visible=true", () => {
    render(
      <DeleteAccountModal 
        visible={true} 
        onClose={onClose} 
        onConfirm={onConfirm} 
      />
    );
    expect(screen.getByText("Confirm Deletion")).toBeTruthy();
  });

  it("calls onClose when Cancel pressed", () => {
    render(
      <DeleteAccountModal 
        visible={true} 
        onClose={onClose} 
        onConfirm={onConfirm} 
      />
    );
    fireEvent.press(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when Confirm Deletion pressed", () => {
    render(
      <DeleteAccountModal 
        visible={true} 
        onClose={onClose} 
        onConfirm={onConfirm} 
      />
    );
    fireEvent.press(screen.getByText("Confirm Deletion"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
