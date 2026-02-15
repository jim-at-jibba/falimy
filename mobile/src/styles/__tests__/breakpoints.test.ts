import { breakpoints } from "@/styles/breakpoints";

describe("breakpoints", () => {
  describe("keys", () => {
    it("has all expected breakpoint keys", () => {
      const expectedKeys = ["xs", "sm", "md", "lg", "xl", "superLarge", "tvLike"];
      const actualKeys = Object.keys(breakpoints);
      
      expect(actualKeys).toEqual(expectedKeys);
    });

    it("has the correct number of breakpoints", () => {
      const breakpointKeys = Object.keys(breakpoints);
      
      expect(breakpointKeys).toHaveLength(7);
    });
  });

  describe("values", () => {
    it("xs starts at 0", () => {
      expect(breakpoints.xs).toBe(0);
    });

    it("has the correct values for all breakpoints", () => {
      expect(breakpoints.xs).toBe(0);
      expect(breakpoints.sm).toBe(576);
      expect(breakpoints.md).toBe(768);
      expect(breakpoints.lg).toBe(992);
      expect(breakpoints.xl).toBe(1200);
      expect(breakpoints.superLarge).toBe(2000);
      expect(breakpoints.tvLike).toBe(4000);
    });
  });

  describe("ordering", () => {
    it("has values in ascending order", () => {
      const values = Object.values(breakpoints);
      const sortedValues = [...values].sort((a, b) => a - b);
      
      expect(values).toEqual(sortedValues);
    });

    it("each breakpoint is greater than or equal to the previous one", () => {
      expect(breakpoints.xs).toBeLessThanOrEqual(breakpoints.sm);
      expect(breakpoints.sm).toBeLessThanOrEqual(breakpoints.md);
      expect(breakpoints.md).toBeLessThanOrEqual(breakpoints.lg);
      expect(breakpoints.lg).toBeLessThanOrEqual(breakpoints.xl);
      expect(breakpoints.xl).toBeLessThanOrEqual(breakpoints.superLarge);
      expect(breakpoints.superLarge).toBeLessThanOrEqual(breakpoints.tvLike);
    });
  });
});
