import Svg, { Circle, type SvgProps } from "react-native-svg";

export default function Circles(props: SvgProps) {
  return (
    <Svg width={277} height={315} viewBox="0 0 277 315" fill="none" {...props}>
      <Circle
        cx={71.0752}
        cy={234.691}
        r={96}
        transform="rotate(15 71.0752 234.691)"
        stroke="#2C2C2C"
      />
      <Circle
        cx={157.88}
        cy={150.282}
        r={96}
        transform="rotate(15 157.88 150.282)"
        fill="white"
        stroke="#2C2C2C"
      />
      <Circle
        cx={38.1049}
        cy={118.188}
        r={96}
        transform="rotate(15 38.1049 118.188)"
        stroke="#2C2C2C"
      />
    </Svg>
  );
}
