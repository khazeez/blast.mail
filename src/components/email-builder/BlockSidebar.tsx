import { BlockType, blockLabels } from "./types";
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

const blockDescriptions: Partial<Record<BlockType, string>> = {
  heading: "Section title",
  text: "Paragraph content",
  image: "Visual content",
  button: "Call to action",
  divider: "Visual separator",
  spacer: "Add spacing",
  social: "Social links",
  columns: "Multi-column layout",
  footer: "Email footer",
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
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-1">
        {blockOrder.map((type) => {
          const Icon = blockIcons[type];
          const description = blockDescriptions[type];
          return (
            <button
              key={type}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-slate-200 hover:bg-white transition-all cursor-pointer group text-left"
              onClick={() => onAddBlock(type)}
            >
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{blockLabels[type]}</p>
                {description && (
                  <p className="text-xs text-muted-foreground truncate">{description}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
