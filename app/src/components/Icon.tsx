import { ICON_PATHS, type IconName } from "./icon-paths";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 15, color = "currentColor", strokeWidth = 1.9 }: IconProps) {
  const segments = ICON_PATHS[name].split(" M");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {segments.map((segment, index) => (
        <path key={index} d={(index ? "M" : "") + segment} />
      ))}
    </svg>
  );
}
