import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EmailBlock, BlockType, defaultBlockProps } from "./types";
import { BlockRenderer } from "./BlockRenderer";
import { BlockSidebar } from "./BlockSidebar";
import { BlockConfigPanel } from "./BlockConfigPanel";
import { PrebuiltTemplatesDialog } from "./PrebuiltTemplatesDialog";
import { prebuiltTemplates, PrebuiltTemplate } from "./prebuilt-templates";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Eye, Code, Settings, PanelLeft, Sparkles, Smartphone, Monitor,
  Link2, Undo, Redo
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailBuilderProps {
  content: string;
  onChange: (html: string) => void;
  utmEnabled?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  onUtmChange?: (utm: { source: string; medium: string; campaign: string }) => void;
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

function generateHtmlFromBlocks(blocks: EmailBlock[], utm?: { source: string; medium: string; campaign: string }): string {
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
          return `<p style="text-align: ${align}; color: ${color}; font-size: ${sizes[fontSize]}; margin: 0 0 16px 0; line-height: 1.6;">${content}</p>`;
        }
        case "image": {
          const { src, alt, link, width, align } = block.props;
          let imgLink = link;
          if (utm && imgLink && imgLink.startsWith("http")) {
            const url = new URL(imgLink);
            url.searchParams.set("utm_source", utm.source);
            url.searchParams.set("utm_medium", utm.medium);
            url.searchParams.set("utm_campaign", utm.campaign);
            imgLink = url.toString();
          }
          const img = `<img src="${src}" alt="${alt}" style="width: ${width}; max-width: 100%; display: block; margin: ${align === "center" ? "0 auto" : align === "right" ? "0 0 0 auto" : "0"};" />`;
          return imgLink ? `<a href="${imgLink}" target="_blank" rel="noopener noreferrer">${img}</a>` : img;
        }
        case "button": {
          let { text, link, backgroundColor, textColor, align, borderRadius } = block.props;
          if (utm && link && link.startsWith("http")) {
            try {
              const url = new URL(link);
              url.searchParams.set("utm_source", utm.source);
              url.searchParams.set("utm_medium", utm.medium);
              url.searchParams.set("utm_campaign", utm.campaign);
              link = url.toString();
            } catch {}
          }
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

interface SortableBlockProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableBlock({ block, isSelected, onSelect, onDelete }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <BlockRenderer
        block={block}
        isSelected={isSelected}
        isDragging={isDragging}
        onSelect={onSelect}
        onDelete={onDelete}
        dragListeners={listeners}
      />
    </div>
  );
}

export function EmailBuilder({ 
  content, 
  onChange,
  utmEnabled = false,
  utmSource = "",
  utmMedium = "",
  utmCampaign = "",
  onUtmChange,
}: EmailBuilderProps) {
  const [blocks, setBlocks] = useState<EmailBlock[]>(() => parseBlocksFromHtml(content));
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "code">("edit");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showUtm, setShowUtm] = useState(utmEnabled);
  const [utm, setUtm] = useState({ source: utmSource, medium: utmMedium, campaign: utmCampaign });
  const [history, setHistory] = useState<EmailBlock[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;
  const activeBlock = blocks.find((b) => b.id === activeId) || null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateHtml = useCallback(
    (newBlocks: EmailBlock[]) => {
      const utmParams = showUtm ? utm : undefined;
      const html = generateHtmlFromBlocks(newBlocks, utmParams);
      onChange(html);
    },
    [onChange, showUtm, utm]
  );

  const saveToHistory = useCallback((newBlocks: EmailBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex]);
      updateHtml(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex]);
      updateHtml(history[newIndex]);
    }
  };

  const handleAddBlock = useCallback(
    (type: BlockType) => {
      const newBlock: EmailBlock = {
        id: generateId(),
        type,
        props: { ...defaultBlockProps[type] },
      };
      const newBlocks = [...blocks, newBlock];
      setBlocks(newBlocks);
      saveToHistory(newBlocks);
      setSelectedBlockId(newBlock.id);
      updateHtml(newBlocks);
    },
    [blocks, updateHtml, saveToHistory]
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
      saveToHistory(newBlocks);
      if (selectedBlockId === id) {
        setSelectedBlockId(null);
      }
      updateHtml(newBlocks);
    },
    [blocks, selectedBlockId, updateHtml, saveToHistory]
  );

  const handleSelectTemplate = (template: PrebuiltTemplate) => {
    const newBlocks: EmailBlock[] = template.blocks.map((block, index) => ({
      id: generateId(),
      type: block.type,
      props: block.props,
    }));
    setBlocks(newBlocks);
    saveToHistory(newBlocks);
    updateHtml(newBlocks);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      setBlocks(newBlocks);
      saveToHistory(newBlocks);
      updateHtml(newBlocks);
    }

    setActiveId(null);
  };

  const handleUtmChange = (field: keyof typeof utm, value: string) => {
    const newUtm = { ...utm, [field]: value };
    setUtm(newUtm);
    onUtmChange?.(newUtm);
    updateHtml(blocks);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowTemplates(true)}
          >
            <Sparkles className="h-4 w-4" />
            Templates
          </Button>
          
          <div className="h-6 w-px bg-border mx-1" />
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border mx-1" />

          <div className="flex items-center gap-2">
            <Switch
              checked={showUtm}
              onCheckedChange={setShowUtm}
            />
            <Label className="text-xs cursor-pointer flex items-center gap-1">
              <Link2 className="h-3 w-3" />
              UTM Tracking
            </Label>
          </div>
        </div>

        {activeTab === "preview" && (
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={previewMode === "desktop" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setPreviewMode("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === "mobile" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setPreviewMode("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* UTM Settings */}
      {showUtm && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">UTM Parameters</span>
            <Badge variant="secondary" className="text-xs">Auto-append to links</Badge>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Source</Label>
              <Input
                placeholder="newsletter"
                value={utm.source}
                onChange={(e) => handleUtmChange("source", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Medium</Label>
              <Input
                placeholder="email"
                value={utm.medium}
                onChange={(e) => handleUtmChange("medium", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Campaign</Label>
              <Input
                placeholder="promo-december"
                value={utm.campaign}
                onChange={(e) => handleUtmChange("campaign", e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Main Builder */}
      <div className="flex h-[600px] border rounded-lg overflow-hidden">
        {showSidebar && (
          <div className="w-56 border-r bg-muted/30">
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
                <Card className="p-8 max-w-3xl mx-auto bg-slate-900 border-slate-700">
                  {blocks.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-2 font-medium">Mulai Membuat Email</p>
                      <p className="text-sm mb-4">Pilih template atau tambahkan block</p>
                      <Button
                        variant="outline"
                        onClick={() => setShowTemplates(true)}
                        className="gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        Pilih Template
                      </Button>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={blocks.map((b) => b.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {blocks.map((block) => (
                            <SortableBlock
                              key={block.id}
                              block={block}
                              isSelected={selectedBlockId === block.id}
                              onSelect={setSelectedBlockId}
                              onDelete={handleDeleteBlock}
                            />
                          ))}
                        </div>
                      </SortableContext>

                      <DragOverlay>
                        {activeBlock ? (
                          <div className="shadow-2xl rounded-lg">
                            <BlockRenderer
                              block={activeBlock}
                              isSelected={false}
                              isDragging={false}
                              onSelect={() => {}}
                              onDelete={() => {}}
                            />
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  )}
                </Card>
              )}

              {activeTab === "preview" && (
                <div className="flex justify-center">
                  <div className={cn(
                    "bg-slate-900 rounded-xl p-4 transition-all",
                    previewMode === "mobile" ? "max-w-sm" : "max-w-3xl w-full"
                  )}>
                    <div
                      className="prose prose-sm max-w-none prose-headings:text-white prose-p:text-slate-200 prose-a:text-primary"
                      dangerouslySetInnerHTML={{ __html: generateHtmlFromBlocks(blocks, showUtm ? utm : undefined) }}
                    />
                  </div>
                </div>
              )}

              {activeTab === "code" && (
                <Card className="p-4 max-w-3xl mx-auto">
                  <pre className="text-xs overflow-auto bg-slate-900 text-slate-100 p-4 rounded-lg">
                    <code>{generateHtmlFromBlocks(blocks, showUtm ? utm : undefined)}</code>
                  </pre>
                </Card>
              )}
            </div>

            {selectedBlock && activeTab === "edit" && (
              <div className="w-72 border-l bg-muted/30">
                <BlockConfigPanel
                  block={selectedBlock}
                  onUpdate={handleUpdateBlock}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Templates Dialog */}
      <PrebuiltTemplatesDialog
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onSelect={handleSelectTemplate}
      />
    </div>
  );
}
