import { SpacerBlockProps } from "../types";

export function SpacerBlock({ height }: SpacerBlockProps) {
  return <div style={{ height: `${height}px` }} />;
}
