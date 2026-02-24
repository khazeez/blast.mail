import { ColumnsBlockProps } from "../types";
import { BlockRendererStatic } from "../BlockRenderer";

export function ColumnsBlock({ columns, gap, children }: ColumnsBlockProps) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {children.map((col, index) => (
        <div key={index} className="space-y-2">
          {col.map((block) => (
            <BlockRendererStatic key={block.id} block={block} />
          ))}
        </div>
      ))}
    </div>
  );
}
