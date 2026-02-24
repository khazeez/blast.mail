import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prebuiltTemplates, PrebuiltTemplate } from "./prebuilt-templates";
import { 
  Search, 
  Check, 
  Sparkles, 
  Newspaper, 
  Gift, 
  HandMetal, 
  Megaphone,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PrebuiltTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: PrebuiltTemplate) => void;
}

const categoryIcons: Record<string, React.FC<{ className?: string }>> = {
  newsletter: Newspaper,
  promo: Gift,
  welcome: HandMetal,
  announcement: Megaphone,
};

const categoryLabels: Record<string, string> = {
  newsletter: "Newsletter",
  promo: "Promo",
  welcome: "Welcome",
  announcement: "Announcement",
  transactional: "Transactional",
};

export function PrebuiltTemplatesDialog({
  open,
  onOpenChange,
  onSelect,
}: PrebuiltTemplatesDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<PrebuiltTemplate | null>(null);

  const categories = ["all", ...new Set(prebuiltTemplates.map((t) => t.category))];

  const filteredTemplates = prebuiltTemplates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (template: PrebuiltTemplate) => {
    onSelect(template);
    onOpenChange(false);
    setPreviewTemplate(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[700px] p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Pilih Template</DialogTitle>
          <DialogDescription>
            Template siap pakai dengan desain profesional dan responsive
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Left: Template List */}
          <div className="w-1/2 border-r flex flex-col">
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari template..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === "all" ? "Semua" : categoryLabels[cat] || cat}
                  </Badge>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setPreviewTemplate(template)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all hover:border-primary/50",
                      previewTemplate?.id === template.id && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                        {template.thumbnail}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{template.name}</p>
                          <Badge variant="secondary" className="text-[10px]">
                            {categoryLabels[template.category]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Smartphone className="h-3 w-3" />
                            Responsive
                          </span>
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {template.blocks.length} blocks
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Tidak ada template ditemukan</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Preview */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {previewTemplate ? previewTemplate.name : "Preview"}
                </p>
                {previewTemplate && (
                  <p className="text-sm text-muted-foreground">
                    {previewTemplate.description}
                  </p>
                )}
              </div>
              {previewTemplate && (
                <Button onClick={() => handleSelect(previewTemplate)}>
                  <Check className="h-4 w-4 mr-1" />
                  Gunakan Template
                </Button>
              )}
            </div>

            <div className="flex-1 flex items-center justify-center bg-slate-900 m-4 rounded-xl overflow-hidden">
              {previewTemplate ? (
                <div className="w-full max-w-sm p-4">
                  <div className="bg-slate-800 rounded-lg p-6 space-y-3">
                    {previewTemplate.blocks.map((block, index) => {
                      if (block.type === "heading") {
                        const sizes: Record<number, string> = {
                          1: "text-xl",
                          2: "text-lg",
                          3: "text-base",
                        };
                        return (
                          <p
                            key={index}
                            className={cn("font-bold", sizes[block.props.level])}
                            style={{ color: block.props.color, textAlign: block.props.align }}
                          >
                            {block.props.content}
                          </p>
                        );
                      }
                      if (block.type === "text") {
                        const sizes: Record<string, string> = {
                          small: "text-xs",
                          medium: "text-sm",
                          large: "text-base",
                        };
                        return (
                          <p
                            key={index}
                            className={sizes[block.props.fontSize] || "text-sm"}
                            style={{ color: block.props.color, textAlign: block.props.align }}
                          >
                            {block.props.content}
                          </p>
                        );
                      }
                      if (block.type === "button") {
                        return (
                          <div key={index} style={{ textAlign: block.props.align }}>
                            <span
                              className="inline-block px-4 py-2 rounded font-medium text-sm"
                              style={{
                                backgroundColor: block.props.backgroundColor,
                                color: block.props.textColor,
                                borderRadius: block.props.borderRadius,
                              }}
                            >
                              {block.props.text}
                            </span>
                          </div>
                        );
                      }
                      if (block.type === "divider") {
                        return (
                          <hr
                            key={index}
                            style={{
                              borderColor: block.props.color,
                              borderWidth: block.props.thickness,
                            }}
                          />
                        );
                      }
                      if (block.type === "spacer") {
                        return <div key={index} style={{ height: block.props.height }} />;
                      }
                      return null;
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Pilih template untuk preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
