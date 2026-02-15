import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import { DatabaseProvider, useDatabase } from "../DatabaseContext";

jest.mock("@/db", () => ({
  database: { name: "mock-database" },
}));

describe("DatabaseContext", () => {
  describe("DatabaseProvider", () => {
    it("renders children correctly", () => {
      const { getByText } = render(
        <DatabaseProvider>
          <Text>Test Child</Text>
        </DatabaseProvider>
      );
      expect(getByText("Test Child")).toBeTruthy();
    });

    it("provides database context to children", () => {
      const TestComponent = () => {
        const db = useDatabase();
        return <Text>{(db as any).name}</Text>;
      };

      const { getByText } = render(
        <DatabaseProvider>
          <TestComponent />
        </DatabaseProvider>
      );

      expect(getByText("mock-database")).toBeTruthy();
    });
  });

  describe("useDatabase", () => {
    it("provides the same database instance to all consumers", () => {
      let db1: any, db2: any;

      const Component1 = () => {
        db1 = useDatabase();
        return <Text>Component1</Text>;
      };

      const Component2 = () => {
        db2 = useDatabase();
        return <Text>Component2</Text>;
      };

      render(
        <DatabaseProvider>
          <>
            <Component1 />
            <Component2 />
          </>
        </DatabaseProvider>
      );

      expect(db1).toBe(db2);
      expect((db1 as any).name).toBe("mock-database");
    });
  });
});
