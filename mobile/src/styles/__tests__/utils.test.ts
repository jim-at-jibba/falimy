// The source module captures Dimensions.get("window") at module load time.
// In the jest-expo test environment, the default dimensions are used.
// We can't easily mock react-native's Dimensions before the module loads,
// so we test against the actual jest-expo default values.
import { Dimensions, PixelRatio } from "react-native";
import { scale, verticalScale, moderateScale, nf, wp, hp, wpx, hpx } from "@/styles/utils";

// Get the actual values from the test environment
const { width, height } = Dimensions.get("window");

describe("style utils", () => {
  describe("scale", () => {
    it("scales value based on width to guideline (375) ratio", () => {
      const factor = width / 375;
      expect(scale(100)).toBeCloseTo(100 * factor, 5);
    });

    it("handles zero input", () => {
      expect(scale(0)).toBe(0);
    });

    it("handles negative input", () => {
      const factor = width / 375;
      expect(scale(-50)).toBeCloseTo(-50 * factor, 5);
    });
  });

  describe("verticalScale", () => {
    it("scales value based on height to guideline (667) ratio", () => {
      const factor = height / 667;
      expect(verticalScale(100)).toBeCloseTo(100 * factor, 5);
    });

    it("handles zero input", () => {
      expect(verticalScale(0)).toBe(0);
    });
  });

  describe("moderateScale", () => {
    it("scales with default factor of 0.5", () => {
      const scaledValue = scale(100);
      const expected = 100 + (scaledValue - 100) * 0.5;
      expect(moderateScale(100)).toBeCloseTo(expected, 5);
    });

    it("scales with custom factor", () => {
      const scaledValue = scale(100);
      const expected = 100 + (scaledValue - 100) * 1;
      expect(moderateScale(100, 1)).toBeCloseTo(expected, 5);
    });

    it("returns input when factor is 0", () => {
      expect(moderateScale(100, 0)).toBe(100);
    });
  });

  describe("nf (normalizeFont)", () => {
    it("returns a number", () => {
      const result = nf(16);
      expect(typeof result).toBe("number");
    });

    it("returns a rounded value", () => {
      const result = nf(16);
      expect(result).toBe(Math.round(result));
    });

    it("handles zero input", () => {
      expect(nf(0)).toBe(0);
    });

    it("scales based on height ratio", () => {
      const scaleNew = height / 667;
      const expected = Math.round(PixelRatio.roundToNearestPixel(16 * scaleNew));
      expect(nf(16)).toBe(expected);
    });
  });

  describe("wp (widthPercentageToDP)", () => {
    it("converts percentage to width DP", () => {
      const expected = PixelRatio.roundToNearestPixel((width * 50) / 100);
      expect(wp("50")).toBe(expected);
    });

    it("converts 100% to full width", () => {
      const expected = PixelRatio.roundToNearestPixel(width);
      expect(wp("100")).toBe(expected);
    });

    it("converts 0% to 0", () => {
      expect(wp("0")).toBe(0);
    });

    it("handles malformed input gracefully", () => {
      // parseFloat("abc") returns NaN
      const result = wp("abc");
      expect(result).toBeNaN();
    });

    it("strips percent sign from input", () => {
      // parseFloat("50%") returns 50
      const expected = PixelRatio.roundToNearestPixel((width * 50) / 100);
      expect(wp("50%")).toBe(expected);
    });
  });

  describe("hp (heightPercentageToDP)", () => {
    it("converts percentage to height DP", () => {
      const expected = PixelRatio.roundToNearestPixel((height * 50) / 100);
      expect(hp("50")).toBe(expected);
    });

    it("converts 100% to full height", () => {
      const expected = PixelRatio.roundToNearestPixel(height);
      expect(hp("100")).toBe(expected);
    });

    it("converts 0% to 0", () => {
      expect(hp("0")).toBe(0);
    });

    it("handles malformed input gracefully", () => {
      const result = hp("invalid");
      expect(result).toBeNaN();
    });
  });

  describe("wpx (widthFromPixel)", () => {
    it("converts pixel width with default reference width (414)", () => {
      const expected = 100 * (width / 414);
      expect(wpx(100)).toBeCloseTo(expected, 2);
    });

    it("converts pixel width with custom reference width", () => {
      const expected = 100 * (width / 375);
      expect(wpx(100, 375)).toBeCloseTo(expected, 2);
    });

    it("handles zero input", () => {
      expect(wpx(0)).toBe(0);
    });
  });

  describe("hpx (heightFromPixel)", () => {
    it("converts pixel height with default reference height (896)", () => {
      const expected = 100 * (height / 896);
      expect(hpx(100)).toBeCloseTo(expected, 2);
    });

    it("converts pixel height with custom reference height", () => {
      const expected = 100 * (height / 667);
      expect(hpx(100, 667)).toBeCloseTo(expected, 2);
    });

    it("handles zero input", () => {
      expect(hpx(0)).toBe(0);
    });
  });
});
