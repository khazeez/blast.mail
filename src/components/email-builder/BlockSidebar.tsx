import { BlockType, blockLabels, defaultBlockProps } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Type,
  Heading2,
  Image,
  MousePointer2,
  Minus,
  Space,
  Share2,
  Columns2,
  LayoutPanelTop,
} from "lucide-react";

const blockIcons: Record<BlockType, React.FC<{ className?: string }>> = {
  heading: Heading2,
  text: Type,
  image: Image,
  button: MousePointer2,
  divider: Minus,
  spacer: Space,
  social: Share2,
  columns: Columns2,
  footer: LayoutPanelTop,
};

const blockOrder: BlockType[] = [
  "heading",
  "text",
  "image",
  "button",
  "divider",
  "spacer",
  "social",
  "columns",
  "footer",
];

interface BlockSidebarProps {
  onAddBlock: (type: BlockType) => void;
}

export function BlockSidebar({ onAddBlock }: BlockSidebarProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h3 className="font-medium text-sm mb-3">Add Blocks</h3>
        <div className="grid grid-cols-2 gap-2">
          {blockOrder.map((type) => {
            const Icon = blockIcons[type];
            return (
              <button
                key={type}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-md border border-border hover:bg-muted hover:border-muted-foreground/30 transition-colors cursor-pointer"
                onClick={() => onAddBlock(type)}
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs">{blockLabels[type]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
