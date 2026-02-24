import { DividerBlockProps } from "../types";

export function DividerBlock({ style, color, thickness }: DividerBlockProps) {
  return (
    <hr
      style={{
        borderStyle: style,
        borderColor: color,
        borderWidth: `${thickness}px 0 0 0`,
        margin: "8px 0",
      }}
    />
  );
}
