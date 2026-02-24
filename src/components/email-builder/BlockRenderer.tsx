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
      <div className="p-4 bg-red-50 text-red-600 rounded">
        Unknown block type: {block.type}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative transition-all cursor-grab",
        isDragging && "opacity-50 cursor-grabbing"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
    >
      <div className="absolute -left-8 top-0 bottom-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="cursor-grab p-1 rounded hover:bg-muted bg-background shadow-sm border">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      {isSelected && (
        <div className="absolute -right-2 top-2 z-10">
          <Button
            variant="destructive"
            size="icon"
            className="h-6 w-6 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <div
        className={cn(
          "rounded-md transition-all p-3",
          isSelected
            ? "ring-2 ring-primary ring-offset-2 bg-primary/5"
            : "hover:ring-1 hover:ring-muted-foreground/30"
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
