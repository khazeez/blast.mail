import { SpacerBlockProps } from "../types";

export function SpacerBlock({ height }: SpacerBlockProps) {
  return (
    <div 
      style={{ height: `${height}px` }} 
      className="bg-slate-50 rounded flex items-center justify-center"
    >
      <span className="text-xs text-muted-foreground">{height}px</span>
    </div>
  );
}
