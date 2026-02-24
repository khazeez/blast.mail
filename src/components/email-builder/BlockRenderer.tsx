import { EmailBlock, blockLabels } from "./types";
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
  dragHandleProps,
}: BlockRendererProps) {
  const Component = blockComponents[block.type];

  if (!Component) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded">
        Unknown block type: {block.type}
      </div>
    );
  }

  return (
    <div
      className={`group relative transition-all ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
    >
      {isSelected && (
        <div className="absolute -left-10 top-0 bottom-0 flex flex-col items-center justify-center gap-1">
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      )}
      <div
        className={`rounded-md transition-all ${
          isSelected
            ? "ring-2 ring-primary ring-offset-2"
            : "hover:ring-1 hover:ring-muted-foreground/30"
        }`}
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
