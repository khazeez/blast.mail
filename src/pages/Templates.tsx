import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Sparkles, FileText, Copy, Eye, Monitor, Smartphone } from "lucide-react";
import { EmailPreviewDialog } from "@/components/EmailPreviewDialog";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/use-i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { prebuiltTemplates, PrebuiltTemplate } from "@/components/email-builder/prebuilt-templates";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const categoryColor: Record<string, "default" | "secondary" | "outline"> = {
  newsletter: "default", 
  promo: "secondary", 
  welcome: "outline", 
  announcement: "outline",
  transactional: "outline",
};

const categoryLabels: Record<string, string> = {
  newsletter: "Newsletter",
  promo: "Promo",
  welcome: "Welcome",
  announcement: "Announcement",
  transactional: "Transactional",
};

function generateHtmlFromBlocks(blocks: any[]): string {
  return blocks.map((block) => {
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
        const { companyName, address, unsubscribeLink, socialLinks } = block.props;
        let html = `<div style="text-align: center; font-size: 14px; color: #6b7280; padding: 16px 0; border-top: 1px solid #e5e5e5;">`;
        html += `<p style="margin: 0 0 4px 0; font-weight: 500;">${companyName}</p>`;
        if (address) html += `<p style="margin: 0 0 8px 0;">${address}</p>`;
        if (unsubscribeLink) html += `<p style="margin: 8px 0 0 0;"><a href="{{unsubscribe_url}}" style="color: #3b82f6;">Unsubscribe</a></p>`;
        html += `</div>`;
        return html;
      }
      case "social": {
        const { platforms, align } = block.props;
        const links = platforms.map((p: any) => `<span style="display: inline-block; margin: 0 8px;">${p.name}</span>`).join("");
        return `<div style="text-align: ${align}; padding: 8px 0;">${links}</div>`;
      }
      default:
        return "";
    }
  }).join("\n");
}

function TemplatePreviewDialog({ 
  template, 
  open, 
  onOpenChange 
}: { 
  template: PrebuiltTemplate; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const content = generateHtmlFromBlocks(template.blocks);

  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #1a1a1a; background: #ffffff; }
        img { max-width: 100%; height: auto; }
        a { color: #4366d0; }
      </style>
    </head>
    <body>${content}</body>
    </html>
  `;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-medium">{template.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border p-0.5">
              <button
                onClick={() => setDevice("desktop")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  device === "desktop" ? "bg-muted" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDevice("mobile")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  device === "mobile" ? "bg-muted" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-muted/20 p-6 flex justify-center">
          <div
            className={cn(
              "bg-background rounded-lg border shadow-sm transition-all duration-300",
              device === "desktop" ? "w-full max-w-[600px]" : "w-[375px]"
            )}
          >
            <iframe
              srcDoc={wrappedHtml}
              title="Template Preview"
              className="w-full border-0 rounded-lg"
              style={{ minHeight: 400 }}
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Templates = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("builtin");
  const [previewTemplate, setPreviewTemplate] = useState<PrebuiltTemplate | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (template: PrebuiltTemplate) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase.from("templates").insert({
        user_id: user.id,
        name: template.name,
        category: template.category,
        description: template.description,
        content: generateHtmlFromBlocks(template.blocks),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template saved to your library!");
      setActiveTab("yours");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template deleted.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("templates.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("templates.subtitle")}</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/templates/new")}>
            <Plus className="h-4 w-4" />
            {t("templates.create")}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="builtin" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Built-in Templates
            </TabsTrigger>
            <TabsTrigger value="yours" className="gap-2">
              <FileText className="h-4 w-4" />
              Your Templates ({templates.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builtin" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {prebuiltTemplates.map((template) => (
                <Card key={template.id} className="border-border/60 flex flex-col overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative group">
                    <span className="text-4xl">{template.thumbnail}</span>
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Eye className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant={categoryColor[template.category] ?? "outline"} className="text-xs capitalize">
                        {categoryLabels[template.category]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>✓ Responsive</span>
                      <span>✓ {template.blocks.length} blocks</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-4 py-3 flex justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => navigate("/templates/new", { state: { template } })}
                    >
                      <Copy className="h-4 w-4" />
                      Use
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      onClick={() => saveTemplateMutation.mutate(template)}
                      disabled={saveTemplateMutation.isPending}
                    >
                      Save Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="yours" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : templates.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No templates yet.</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by using a built-in template or create your own.
                </p>
                <Button variant="outline" onClick={() => setActiveTab("builtin")}>
                  Browse Built-in Templates
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((tpl) => (
                  <Card key={tpl.id} className="border-border/60 flex flex-col">
                    <CardContent className="flex-1 p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-medium">{tpl.name}</h3>
                        <Badge variant={categoryColor[tpl.category] ?? "outline"} className="capitalize">
                          {tpl.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tpl.description || "No description."}
                      </p>
                    </CardContent>
                    <CardFooter className="border-t px-5 py-3 flex justify-between">
                      <EmailPreviewDialog
                        subject={tpl.name}
                        content={tpl.content}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(tpl.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Template Preview Dialog */}
        {previewTemplate && (
          <TemplatePreviewDialog
            template={previewTemplate}
            open={!!previewTemplate}
            onOpenChange={(open) => !open && setPreviewTemplate(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Templates;
