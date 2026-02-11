import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 667;

const scale = (size: number): number => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number): number => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor: number = 0.5): number =>
  size + (scale(size) - size) * factor;

// FONT SCALING
// Usage: nf(16)
const scaleNew = height / 667;
const normalizeFont = (size: number): number => {
  const newSize = size * scaleNew;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// DYNAMIC DIMENSION CONSTANTS
// Usage: wp(5), hp(20)
const widthPercentageToDP = (widthPercent: string): number => {
  // Convert string input to decimal number
  const elemWidth = parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((width * elemWidth) / 100);
};
const heightPercentageToDP = (heightPercent: string): number => {
  // Convert string input to decimal number
  const elemHeight = parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((height * elemHeight) / 100);
};

// Usage: wpx(141), hpx(220)
const widthFromPixel = (widthPx: number, w: number = 414): number => widthPx * (width / w);
const heightFromPixel = (heightPx: number, h: number = 896): number => heightPx * (height / h);

export {
  scale,
  verticalScale,
  moderateScale,
  normalizeFont as nf,
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  widthFromPixel as wpx,
  heightFromPixel as hpx,
};
