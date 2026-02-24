import { EmailBlock } from "./types";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ButtonBlock } from "./blocks/ButtonBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { SpacerBlock } from "./blocks/SpacerBlock";
import { SocialBlock } from "./blocks/SocialBlock";
import { ColumnsBlock } from "./blocks/ColumnsBlock";
import { FooterBlock } from "./blocks/FooterBlock";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlockRendererProps {
  block: EmailBlock;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const blockComponents: Record<string, React.FC<any>> = {
  heading: HeadingBlock,
  text: TextBlock,
  image: ImageBlock,
  button: ButtonBlock,
  divider: DividerBlock,
  spacer: SpacerBlock,
  social: SocialBlock,
  columns: ColumnsBlock,
  footer: FooterBlock,
};

export function BlockRenderer({
  block,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
}: BlockRendererProps) {
  const Component = blockComponents[block.type];

  if (!Component) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
        Unknown block type: {block.type}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative transition-all",
        isDragging && "opacity-50"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
    >
      {isSelected && (
        <div className="absolute -left-10 top-0 bottom-0 flex flex-col items-center justify-center gap-1 z-10">
          <div
            className="cursor-grab active:cursor-grabbing p-1.5 rounded bg-white border shadow-sm hover:bg-slate-50"
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
            }}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-white border shadow-sm hover:bg-destructive hover:text-destructive-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      <div
        className={cn(
          "rounded-lg transition-all p-3",
          isSelected
            ? "ring-2 ring-primary ring-offset-2 bg-primary/5"
            : "hover:ring-1 hover:ring-slate-300 hover:bg-slate-50"
        )}
      >
        <Component {...block.props} />
      </div>
    </div>
  );
}

export function BlockRendererStatic({ block }: { block: EmailBlock }) {
  const Component = blockComponents[block.type];

  if (!Component) {
    return null;
  }

  return <Component {...block.props} />;
}
