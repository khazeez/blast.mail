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
import { FileText, Search, Eye, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

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
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

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
  };

  const categories = [...new Set(templates?.map((t) => t.category).filter(Boolean))];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          {selectedTemplateId ? "Change Template" : "Browse Templates"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select a Template</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="w-1/2 flex flex-col border-r pr-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2 mb-3 flex-wrap">
              <Badge
                variant={!search ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSearch("")}
              >
                All
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={search === cat ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setSearch(cat as string)}
                >
                  {cat}
                </Badge>
              ))}
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-2">
                <button
                  onClick={() => {
                    setPreviewTemplate(null);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                    !selectedTemplateId
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Blank Template</p>
                    <p className="text-xs text-muted-foreground">Start from scratch</p>
                  </div>
                  {!selectedTemplateId && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>

                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading templates...
                  </div>
                ) : filteredTemplates && filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => (
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
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {search ? "No templates found" : "No templates yet. Create one first."}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="w-1/2 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Preview</h3>
              {previewTemplate && (
                <Button size="sm" onClick={() => handleSelect(previewTemplate)}>
                  Use This Template
                </Button>
              )}
            </div>
            
            <div className="flex-1 rounded-lg border bg-muted/30 overflow-hidden">
              {previewTemplate ? (
                <div className="h-full flex flex-col">
                  <div className="p-3 border-b bg-muted/50">
                    <p className="font-medium">{previewTemplate.name}</p>
                    {previewTemplate.description && (
                      <p className="text-xs text-muted-foreground">{previewTemplate.description}</p>
                    )}
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewTemplate.content || "" }}
                    />
                  </ScrollArea>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a template to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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
