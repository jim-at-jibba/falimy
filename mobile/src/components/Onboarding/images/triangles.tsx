import Svg, { Circle, Path, type SvgProps } from "react-native-svg";

export default function Triangles(props: SvgProps) {
  return (
    <Svg width={329} height={296} viewBox="0 0 329 296" fill="none" {...props}>
      <Path
        d="M103.984 341.406L13.7583 84.5193L282.006 134.591L103.984 341.406Z"
        fill="white"
        stroke="#2C2C2C"
      />
      <Path
        d="M123.707 83.6954L145.874 0.96468L206.652 61.5851L123.707 83.6954Z"
        fill="#EDF0F2"
        stroke="#2C2C2C"
      />
      <Circle
        cx={75.188}
        cy={118.188}
        r={96}
        transform="rotate(15 75.188 118.188)"
        stroke="#2C2C2C"
      />
    </Svg>
  );
}
