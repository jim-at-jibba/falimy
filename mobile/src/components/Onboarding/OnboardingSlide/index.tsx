import type React from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, { interpolate, type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type SlideProps = {
  translateX: SharedValue<number>;
  index: number;
  children: React.ReactNode;
};

export const OnboardingSlide = ({ translateX, index, children }: SlideProps) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const animatedStyle = useAnimatedStyle(() => {
    const input = translateX.value / SCREEN_WIDTH;
    const translateY = interpolate(input, [index - 1, index, index + 1], [100, 0, 100], "clamp");
    const opacity = interpolate(input, [index - 1, index, index + 1], [0, 1, 0], "clamp");

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={[styles.slideContainer, { width: SCREEN_WIDTH }]}>
      <Animated.View style={[styles.slideContent, animatedStyle]}>{children}</Animated.View>
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  slideContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  slideContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
}));
