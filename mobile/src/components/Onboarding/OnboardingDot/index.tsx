import { useWindowDimensions } from "react-native";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type DotProps = {
  translateX: Animated.SharedValue<number>;
  index: number;
};

export const PaginationDot = ({ translateX, index }: DotProps) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const dotStyle = useAnimatedStyle(() => {
    const input = translateX.value / SCREEN_WIDTH;
    const opacity = interpolate(input, [index - 1, index, index + 1], [0.5, 1, 0.5], "clamp");
    const scale = interpolate(input, [index - 1, index, index + 1], [1, 1.25, 1], "clamp");

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return <Animated.View style={[styles.dot, dotStyle]} />;
};

const styles = StyleSheet.create((theme) => ({
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadiusSm / 2,
    backgroundColor: theme.colors.grey,
    marginHorizontal: theme.spacing[1],
  },
}));
