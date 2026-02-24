import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Eye, Check, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { prebuiltTemplates } from "@/components/email-builder/prebuilt-templates";

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  description: string | null;
}

interface TemplateBrowserProps {
  selectedTemplateId: string | null;
  onSelect: (template: Template | null) => void;
}

export function TemplateBrowser({ selectedTemplateId, onSelect }: TemplateBrowserProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("builtin");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewBuiltIn, setPreviewBuiltIn] = useState<any | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("templates")
        .select("id, name, category, content, description")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Template[];
    },
    enabled: !!user,
  });

  const filteredTemplates = templates?.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (template: Template | null) => {
    onSelect(template);
    setOpen(false);
    setPreviewTemplate(null);
    setPreviewBuiltIn(null);
  };

  const handleSelectBuiltIn = (template: any) => {
    const newTemplate: Template = {
      id: template.id,
      name: template.name,
      category: template.category,
      content: generateHtmlFromBlocks(template.blocks),
      description: template.description,
    };
    onSelect(newTemplate);
    setOpen(false);
  };

  const generateHtmlFromBlocks = (blocks: any[]): string => {
    return blocks.map((block: any) => {
      switch (block.type) {
        case "heading": {
          const { content, level, align, color } = block.props;
          return `<h${level} style="text-align: ${align}; color: ${color}; margin: 0 0 16px 0;">${content}</h${level}>`;
        }
        case "text": {
          const { content, align, color, fontSize } = block.props;
          const sizes: Record<string, string> = { small: "14px", medium: "16px", large: "18px" };
          return `<p style="text-align: ${align}; color: ${color}; font-size: ${sizes[fontSize]}; margin: 0 0 16px 0; line-height: 1.6;">${content}</p>`;
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
        case "footer": {
          const { companyName, address, unsubscribeLink } = block.props;
          let html = `<div style="text-align: center; font-size: 14px; color: #6b7280; padding: 16px 0; border-top: 1px solid #e5e5e5;">`;
          html += `<p style="margin: 0 0 4px 0; font-weight: 500;">${companyName}</p>`;
          if (address) html += `<p style="margin: 0 0 8px 0;">${address}</p>`;
          if (unsubscribeLink) html += `<p style="margin: 8px 0 0 0;"><a href="{{unsubscribe_url}}" style="color: #3b82f6;">Unsubscribe</a></p>`;
          html += `</div>`;
          return html;
        }
        default:
          return "";
      }
    }).join("\n");
  };

  const filteredBuiltIn = prebuiltTemplates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          {selectedTemplateId ? "Change Template" : "Browse Templates"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[650px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select a Template</DialogTitle>
        </DialogHeader>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="builtin" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Built-in ({prebuiltTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="yours" className="gap-2">
              <FileText className="h-4 w-4" />
              Yours ({templates?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builtin" className="flex-1 flex gap-4 mt-0">
            <ScrollArea className="flex-1 h-[400px]">
              <div className="grid grid-cols-2 gap-3 p-1">
                {filteredBuiltIn.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setPreviewBuiltIn(template)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all hover:border-primary/30",
                      previewBuiltIn?.id === template.id && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{template.thumbnail}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{template.name}</p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <div className="w-64 border-l rounded-lg bg-muted/30 p-4 flex flex-col">
              <h4 className="text-sm font-medium mb-3">Preview</h4>
              {previewBuiltIn ? (
                <div className="flex-1 flex flex-col">
                  <p className="font-medium">{previewBuiltIn.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">{previewBuiltIn.description}</p>
                  <div className="flex-1 bg-slate-900 rounded-lg p-3 text-sm text-white overflow-auto">
                    {previewBuiltIn.blocks.slice(0, 3).map((block: any, i: number) => (
                      <div key={i} className="mb-2">
                        {block.type === "heading" && (
                          <p className="font-bold" style={{ color: block.props.color }}>
                            {block.props.content}
                          </p>
                        )}
                        {block.type === "text" && (
                          <p style={{ color: block.props.color }}>{block.props.content}</p>
                        )}
                        {block.type === "button" && (
                          <span
                            className="inline-block px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: block.props.backgroundColor, color: block.props.textColor }}
                          >
                            {block.props.text}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => handleSelectBuiltIn(previewBuiltIn)}
                  >
                    Use This Template
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  Select a template to preview
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="yours" className="flex-1 flex gap-4 mt-0">
            <ScrollArea className="flex-1 h-[400px]">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : !templates || templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No templates yet.</p>
                  <p className="text-xs mt-1">Create one in the Templates page.</p>
                </div>
              ) : (
                <div className="space-y-2 p-1">
                  {filteredTemplates?.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setPreviewTemplate(template)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                        selectedTemplateId === template.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium truncate",
                          selectedTemplateId === template.id && "text-primary"
                        )}>
                          {template.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {template.description || template.category}
                        </p>
                      </div>
                      {selectedTemplateId === template.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="w-64 border-l rounded-lg bg-muted/30 p-4 flex flex-col">
              <h4 className="text-sm font-medium mb-3">Preview</h4>
              {previewTemplate ? (
                <div className="flex-1 flex flex-col">
                  <p className="font-medium">{previewTemplate.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">{previewTemplate.description}</p>
                  <ScrollArea className="flex-1 bg-slate-900 rounded-lg p-3">
                    <div
                      className="prose prose-sm prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewTemplate.content || "" }}
                    />
                  </ScrollArea>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => handleSelect(previewTemplate)}
                  >
                    Use This Template
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  <div className="text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Select a template to preview</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="ghost" onClick={() => handleSelect(null)}>
            Use Blank
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
