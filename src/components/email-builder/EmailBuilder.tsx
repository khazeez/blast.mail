import { useState, useCallback } from "react";
import { EmailBlock, BlockType, defaultBlockProps } from "./types";
import { BlockRenderer } from "./BlockRenderer";
import { BlockSidebar } from "./BlockSidebar";
import { BlockConfigPanel } from "./BlockConfigPanel";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Code, Settings, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailBuilderProps {
  content: string;
  onChange: (html: string) => void;
}

function generateId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function parseBlocksFromHtml(html: string): EmailBlock[] {
  if (!html || html.trim() === "") return [];
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const blocks: EmailBlock[] = [];
    
    const processNode = (node: Element): void => {
      const tagName = node.tagName.toLowerCase();
      
      if (["h1", "h2", "h3"].includes(tagName)) {
        blocks.push({
          id: generateId(),
          type: "heading",
          props: {
            content: node.textContent || "",
            level: parseInt(tagName[1]) as 1 | 2 | 3,
            align: (node.getAttribute("style")?.match(/text-align:\s*(\w+)/)?.[1] as any) || "left",
            color: (node.getAttribute("style")?.match(/color:\s*([^;]+)/)?.[1]) || "#1a1a1a",
          },
        });
      } else if (tagName === "p") {
        blocks.push({
          id: generateId(),
          type: "text",
          props: {
            content: node.textContent || "",
            align: (node.getAttribute("style")?.match(/text-align:\s*(\w+)/)?.[1] as any) || "left",
            color: (node.getAttribute("style")?.match(/color:\s*([^;]+)/)?.[1]) || "#4a4a4a",
            fontSize: "medium",
          },
        });
      } else if (tagName === "img") {
        blocks.push({
          id: generateId(),
          type: "image",
          props: {
            src: node.getAttribute("src") || "",
            alt: node.getAttribute("alt") || "",
            link: "",
            width: "100%",
            align: "center",
          },
        });
      } else if (tagName === "a" && node.querySelector("img")) {
        const img = node.querySelector("img")!;
        blocks.push({
          id: generateId(),
          type: "image",
          props: {
            src: img.getAttribute("src") || "",
            alt: img.getAttribute("alt") || "",
            link: node.getAttribute("href") || "",
            width: "100%",
            align: "center",
          },
        });
      } else if (tagName === "a" && node.classList.contains("inline-block")) {
        blocks.push({
          id: generateId(),
          type: "button",
          props: {
            text: node.textContent || "",
            link: node.getAttribute("href") || "",
            backgroundColor: (node.getAttribute("style")?.match(/background-color:\s*([^;]+)/)?.[1]) || "#3b82f6",
            textColor: (node.getAttribute("style")?.match(/color:\s*([^;]+)/)?.[1]) || "#ffffff",
            align: "center",
            borderRadius: 6,
          },
        });
      } else if (tagName === "hr") {
        blocks.push({
          id: generateId(),
          type: "divider",
          props: {
            style: (node.getAttribute("style")?.match(/border-style:\s*(\w+)/)?.[1] as any) || "solid",
            color: (node.getAttribute("style")?.match(/border-color:\s*([^;]+)/)?.[1]) || "#e5e5e5",
            thickness: 1,
          },
        });
      } else if (tagName === "div" && node.classList.contains("spacer")) {
        const height = parseInt(node.getAttribute("style")?.match(/height:\s*(\d+)px/)?.[1] || "20");
        blocks.push({
          id: generateId(),
          type: "spacer",
          props: { height },
        });
      } else {
        for (const child of Array.from(node.children)) {
          processNode(child);
        }
      }
    };
    
    for (const child of Array.from(doc.body.children)) {
      processNode(child);
    }
    
    return blocks;
  } catch {
    return [];
  }
}

function generateHtmlFromBlocks(blocks: EmailBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading": {
          const { content, level, align, color } = block.props;
          return `<h${level} style="text-align: ${align}; color: ${color}; margin: 0 0 16px 0;">${content}</h${level}>`;
        }
        case "text": {
          const { content, align, color, fontSize } = block.props;
          const sizes = { small: "14px", medium: "16px", large: "18px" };
          return `<p style="text-align: ${align}; color: ${color}; font-size: ${sizes[fontSize]}; margin: 0 0 16px 0;">${content}</p>`;
        }
        case "image": {
          const { src, alt, link, width, align } = block.props;
          const img = `<img src="${src}" alt="${alt}" style="width: ${width}; max-width: 100%; display: block; margin: ${align === "center" ? "0 auto" : align === "right" ? "0 0 0 auto" : "0"};" />`;
          return link ? `<a href="${link}" target="_blank" rel="noopener noreferrer">${img}</a>` : img;
        }
        case "button": {
          const { text, link, backgroundColor, textColor, align, borderRadius } = block.props;
          return `<div style="text-align: ${align}; margin: 16px 0;"><a href="${link || "#"}" style="display: inline-block; padding: 12px 24px; background-color: ${backgroundColor}; color: ${textColor}; text-decoration: none; border-radius: ${borderRadius}px; font-weight: 500;">${text}</a></div>`;
        }
        case "divider": {
          const { style, color, thickness } = block.props;
          return `<hr style="border-style: ${style}; border-color: ${color}; border-width: ${thickness}px 0 0 0; margin: 16px 0;" />`;
        }
        case "spacer": {
          const { height } = block.props;
          return `<div style="height: ${height}px;"></div>`;
        }
        case "social": {
          const { platforms, align } = block.props;
          const links = platforms
            .map((p: any) => `<a href="${p.url || "#"}" style="display: inline-block; margin: 0 8px;">${p.name}</a>`)
            .join("");
          return `<div style="text-align: ${align}; padding: 8px 0;">${links}</div>`;
        }
        case "footer": {
          const { companyName, address, unsubscribeLink, socialLinks } = block.props;
          let html = `<div style="text-align: center; font-size: 14px; color: #6b7280; padding: 16px 0; border-top: 1px solid #e5e5e5;">`;
          html += `<p style="margin: 0 0 4px 0; font-weight: 500;">${companyName}</p>`;
          if (address) html += `<p style="margin: 0 0 8px 0;">${address}</p>`;
          if (socialLinks) html += `<p style="margin: 8px 0;">[Social Links]</p>`;
          if (unsubscribeLink) html += `<p style="margin: 8px 0 0 0;"><a href="{{unsubscribe_url}}" style="color: #3b82f6;">Unsubscribe</a> from this list.</p>`;
          html += `</div>`;
          return html;
        }
        case "columns": {
          return `<div style="display: flex; gap: ${block.props.gap}px;">[Columns content]</div>`;
        }
        default:
          return "";
      }
    })
    .join("\n");
}

export function EmailBuilder({ content, onChange }: EmailBuilderProps) {
  const [blocks, setBlocks] = useState<EmailBlock[]>(() => parseBlocksFromHtml(content));
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "code">("edit");
  const [showSidebar, setShowSidebar] = useState(true);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  const updateHtml = useCallback(
    (newBlocks: EmailBlock[]) => {
      const html = generateHtmlFromBlocks(newBlocks);
      onChange(html);
    },
    [onChange]
  );

  const handleAddBlock = useCallback(
    (type: BlockType) => {
      const newBlock: EmailBlock = {
        id: generateId(),
        type,
        props: { ...defaultBlockProps[type] },
      };
      const newBlocks = [...blocks, newBlock];
      setBlocks(newBlocks);
      setSelectedBlockId(newBlock.id);
      updateHtml(newBlocks);
    },
    [blocks, updateHtml]
  );

  const handleUpdateBlock = useCallback(
    (id: string, props: Record<string, any>) => {
      const newBlocks = blocks.map((b) =>
        b.id === id ? { ...b, props: { ...b.props, ...props } } : b
      );
      setBlocks(newBlocks);
      updateHtml(newBlocks);
    },
    [blocks, updateHtml]
  );

  const handleDeleteBlock = useCallback(
    (id: string) => {
      const newBlocks = blocks.filter((b) => b.id !== id);
      setBlocks(newBlocks);
      if (selectedBlockId === id) {
        setSelectedBlockId(null);
      }
      updateHtml(newBlocks);
    },
    [blocks, selectedBlockId, updateHtml]
  );

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex > draggedIndex ? dropIndex - 1 : dropIndex, 0, draggedBlock);

    setBlocks(newBlocks);
    setDraggedIndex(null);
    setDragOverIndex(null);
    updateHtml(newBlocks);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {showSidebar && (
        <div className="w-48 border-r bg-muted/30">
          <BlockSidebar onAddBlock={handleAddBlock} />
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="edit" className="text-xs px-3">
                <Settings className="h-3 w-3 mr-1" /> Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs px-3">
                <Eye className="h-3 w-3 mr-1" /> Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs px-3">
                <Code className="h-3 w-3 mr-1" /> Code
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div
            className="flex-1 overflow-auto p-4 bg-background"
            onClick={() => setSelectedBlockId(null)}
          >
            {activeTab === "edit" && (
              <Card className="p-6 max-w-2xl mx-auto">
                {blocks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-2">No blocks yet</p>
                    <p className="text-sm">Click a block type on the left to add content</p>
                  </div>
                ) : (
                  <div className="space-y-2 pl-8">
                    {blocks.map((block, index) => (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(index)}
                        onDragEnd={handleDragEnd}
                        className={`
                          ${dragOverIndex === index && draggedIndex !== null && draggedIndex !== index ? "border-t-2 border-primary" : ""}
                          ${draggedIndex === index ? "opacity-50" : ""}
                        `}
                      >
                        <BlockRenderer
                          block={block}
                          isSelected={selectedBlockId === block.id}
                          isDragging={draggedIndex === index}
                          onSelect={setSelectedBlockId}
                          onDelete={handleDeleteBlock}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {activeTab === "preview" && (
              <Card className="p-6 max-w-2xl mx-auto">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: generateHtmlFromBlocks(blocks) }}
                />
              </Card>
            )}

            {activeTab === "code" && (
              <Card className="p-4 max-w-2xl mx-auto">
                <pre className="text-xs overflow-auto bg-muted p-4 rounded">
                  <code>{generateHtmlFromBlocks(blocks)}</code>
                </pre>
              </Card>
            )}
          </div>

          {selectedBlock && activeTab === "edit" && (
            <div className="w-64 border-l bg-muted/30">
              <BlockConfigPanel
                block={selectedBlock}
                onUpdate={handleUpdateBlock}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
